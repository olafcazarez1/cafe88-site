import type { H3Event } from 'h3'

import { erpFetch } from './erp'
import { paypalFetch } from './paypal'
import { mapDeliveryAddress } from './delivery-address'

export type DeliveryAddress = {
    name: string
    email: string
    phone: string
    street: string
    exteriorNumber: string
    interiorNumber: string
    neighborhood: string
    postalCode: string
    city: string
    state: string
    reference: string
}

type CheckoutIntentResponse = {
    cart_id: string
    provider: string
    provider_reference: string
    status: string
    delivery_address: DeliveryAddress
}

type ErpCheckoutResponse = {
    document_id: string
    code: string
    payment_id: string
    payment_code: string
    payment_status: string
    total: number
    currency: string
    already_processed: boolean
}

type PayPalCapture = {
    id: string
    status: string

    amount: {
        currency_code: string
        value: string
    }

    custom_id?: string
    invoice_id?: string
    final_capture?: boolean

    create_time?: string
    update_time?: string

    supplementary_data?: {
        related_ids?: {
            order_id?: string
        }
    }

    seller_receivable_breakdown?: {
        gross_amount?: {
            currency_code: string
            value: string
        }

        paypal_fee?: {
            currency_code: string
            value: string
        }

        net_amount?: {
            currency_code: string
            value: string
        }
    }

    [key: string]: unknown
}

type PayPalOrder = {
    id: string
    status: string

    payer?: {
        email_address?: string

        name?: {
            given_name?: string
            surname?: string
        }
    }

    purchase_units?: Array<{
        reference_id?: string
        custom_id?: string
        invoice_id?: string
    }>

    [key: string]: unknown
}

export type PayPalCompletedCheckout = {
    payment: {
        provider: 'paypal'
        provider_order_id: string
        transaction_id: string
        transaction_status: string
        status_detail: string
        amount: string
        currency: string
        payer_email: string | null
        payer_name: string
        payment_method: string
        payment_type: string
    }

    sales_document: ErpCheckoutResponse
}

type ProcessOptions = {
    event: H3Event
    captureId: string

    /*
     * The browser capture route already knows the order ID.
     * A webhook can recover it from the capture details.
     */
    orderId?: string

    /*
     * Browser checkout provides the address directly.
     * Webhook processing restores it from checkout-intent.
     */
    deliveryAddress?: DeliveryAddress
}

export async function processPayPalCheckout(
    options: ProcessOptions
): Promise<PayPalCompletedCheckout> {
    const {
        event,
        deliveryAddress
    } = options

    const captureId = String(
        options.captureId ?? ''
    ).trim()

    if (!captureId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El identificador de la transacción de PayPal es requerido.'
        })
    }

    /*
     * Always verify the capture directly with PayPal.
     * Do not trust the browser or webhook payload by itself.
     */
    const capture =
        await paypalFetch<PayPalCapture>(
            event,
            `/v2/payments/captures/${encodeURIComponent(
                captureId
            )}`,
            {
                method: 'GET'
            }
        )

    if (capture.status !== 'COMPLETED') {
        throw createError({
            statusCode: 409,
            statusMessage:
                `PayPal capture is ${capture.status}.`,

            data: {
                capture_id:
                    capture.id,

                status:
                    capture.status
            }
        })
    }

    const orderId = String(
        options.orderId ??
        capture.supplementary_data
            ?.related_ids
            ?.order_id ??
        ''
    ).trim()

    let order: PayPalOrder | null = null

    /*
     * The order provides:
     *
     * - cart reference fallback
     * - payer email
     * - payer name
     */
    if (orderId) {
        order =
            await paypalFetch<PayPalOrder>(
                event,
                `/v2/checkout/orders/${encodeURIComponent(
                    orderId
                )}`,
                {
                    method: 'GET'
                }
            )
    }

    const purchaseUnit =
        order?.purchase_units?.[0]

    const cartId = String(
        capture.custom_id ??
        purchaseUnit?.custom_id ??
        purchaseUnit?.reference_id ??
        ''
    ).trim()

    if (!cartId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El pago de PayPal no contiene la referencia del carrito.'
        })
    }

    const amount =
        Number(capture.amount?.value)

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw createError({
            statusCode: 502,
            statusMessage:
                'PayPal no devolvió un importe válido para la transacción.'
        })
    }

    const currency = String(
        capture.amount?.currency_code ??
        ''
    ).trim()

    if (!currency) {
        throw createError({
            statusCode: 502,
            statusMessage:
                'PayPal no devolvió la moneda de la transacción.'
        })
    }

    await updateCheckoutIntent(
        event,
        cartId,
        {
            status: 'processing',
            provider_reference:
                capture.id
        }
    )

    let resolvedAddress =
        deliveryAddress

    /*
     * Webhooks do not have browser localStorage or the original
     * cart cookie. Restore the address saved before redirecting
     * the customer to PayPal.
     */
    if (!resolvedAddress) {
        const intent =
            await erpFetch<CheckoutIntentResponse>(
                event,
                `/api/shopping-cart/checkout-intent/${encodeURIComponent(
                    cartId
                )}`,
                {
                    method: 'GET'
                }
            )

        resolvedAddress =
            intent.delivery_address
    }

    if (!resolvedAddress) {
        throw createError({
            statusCode: 409,
            statusMessage:
                'No se encontró la dirección de entrega del pedido.'
        })
    }

    const payerEmail =
        order?.payer?.email_address ??
        null

    const payerName = [
        order?.payer?.name?.given_name,
        order?.payer?.name?.surname
    ]
        .filter(Boolean)
        .join(' ')

    /*
     * ERP accepts a trusted cart_id because webhook requests do
     * not include the customer's cafe88_cart_token cookie.
     */
    const salesDocument =
        await erpFetch<ErpCheckoutResponse>(
            event,
            '/api/shopping-cart/checkout',
            {
                method: 'POST',

                body: {
                    cart_id:
                        cartId,

                    payment: {
                        provider:
                            'paypal',

                        provider_order_id:
                            orderId || cartId,

                        provider_transaction_id:
                            capture.id,

                        provider_status:
                            capture.status,

                        provider_status_detail:
                            '',

                        amount,

                        currency,

                        payer_email:
                            payerEmail,

                        payment_method:
                            'paypal',

                        payment_type:
                            'paypal',

                        provider_data: {
                            capture,
                            order
                        }
                    },

                    /*
                     * SAT defaults agreed for online payments.
                     *
                     * 31  = Intermediario de pagos
                     * PUE = Pago en una sola exhibición
                     * G03 = Gastos en general
                     */
                    payment_method:
                        '31',

                    payment_type:
                        'PUE',

                    fiscal_use:
                        'G03',

                    delivery_address:
                        mapDeliveryAddress(
                            resolvedAddress
                        )
                }
            }
        )

    /*
     * This update is idempotent. The ERP checkout endpoint also
     * protects against duplicate documents and capture IDs.
     */
    await markCheckoutIntentCompleted(
        event,
        cartId,
        capture,
        salesDocument
    )

    return {
        payment: {
            provider:
                'paypal',

            provider_order_id:
                orderId || cartId,

            transaction_id:
                capture.id,

            transaction_status:
                capture.status,

            status_detail:
                '',

            amount:
                capture.amount.value,

            currency,

            payer_email:
                payerEmail,

            payer_name:
                payerName,

            payment_method:
                'paypal',

            payment_type:
                'paypal'
        },

        sales_document:
            salesDocument
    }
}

async function markCheckoutIntentCompleted(
    event: H3Event,
    cartId: string,
    capture: PayPalCapture,
    salesDocument: ErpCheckoutResponse
): Promise<void> {
    try {
        await erpFetch(
            event,
            `/api/shopping-cart/checkout-intent/${encodeURIComponent(
                cartId
            )}`,
            {
                method: 'PATCH',

                body: {
                    status:
                        'completed',

                    provider_reference:
                        capture.id,

                    document_id:
                        salesDocument.document_id
                }
            }
        )
    } catch (error) {
        /*
         * The order already exists. Do not turn a completed
         * purchase into a customer-facing failure because the
         * checkout-intent bookkeeping update failed.
         */
        console.error(
            '[PayPal] Unable to update checkout intent:',
            error
        )
    }
}

async function updateCheckoutIntent(
    event: H3Event,
    cartId: string,
    body: {
        status?:
        | 'pending'
        | 'processing'
        | 'completed'
        | 'failed'

        provider_reference?: string
        document_id?: string
    }
): Promise<void> {
    await erpFetch(
        event,
        `/api/shopping-cart/checkout-intent/${encodeURIComponent(
            cartId
        )}`,
        {
            method: 'PATCH',
            body
        }
    )
}