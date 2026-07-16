import type { H3Event } from 'h3'
import { erpFetch } from './erp'

import {
    getMercadoPagoCartId,
    getMercadoPagoPayment,
    type MercadoPagoPayment
} from './mercado-pago'

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

export type MercadoPagoCompletedCheckout = {
    payment: {
        provider: 'mercado_pago'
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
    paymentId: string

    /*
     * Browser return may still provide the address.
     * Webhook leaves this undefined and loads the saved intent.
     */
    deliveryAddress?: DeliveryAddress
}

export async function processMercadoPagoCheckout(
    options: ProcessOptions
): Promise<MercadoPagoCompletedCheckout> {
    const {
        event,
        paymentId,
        deliveryAddress
    } = options

    if (!/^\d+$/.test(paymentId)) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El identificador de Mercado Pago no es válido.'
        })
    }

    const payment =
        await getMercadoPagoPayment(
            event,
            paymentId
        )

    if (payment.status !== 'approved') {
        throw createError({
            statusCode: 409,
            statusMessage:
                `Mercado Pago payment is ${payment.status}.`,

            data: {
                payment_id:
                    String(payment.id),

                status:
                    payment.status,

                status_detail:
                    payment.status_detail ?? null
            }
        })
    }

    const cartId =
        getMercadoPagoCartId(payment)

    if (!cartId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El pago no contiene la referencia del carrito.'
        })
    }

    let resolvedAddress = deliveryAddress

    /*
     * A webhook does not have browser localStorage or the original
     * cart cookie, so load the pending checkout by cart_id.
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

    /*
     * ERP must accept this trusted cart_id because webhook calls
     * have no cafe88_cart_token cookie.
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
                            'mercado_pago',

                        provider_order_id:
                            cartId,

                        provider_transaction_id:
                            String(payment.id),

                        provider_status:
                            payment.status,

                        provider_status_detail:
                            payment.status_detail ?? '',

                        amount:
                            Number(
                                payment.transaction_amount
                            ),

                        currency:
                            payment.currency_id,

                        payer_email:
                            payment.payer?.email ?? null,

                        payment_method:
                            payment.payment_method_id ?? '',

                        payment_type:
                            payment.payment_type_id ?? '',

                        provider_data:
                            payment
                    },

                    payment_method:
                        '31',

                    payment_type:
                        'PUE',

                    fiscal_use:
                        'G03',

                    delivery_address:
                        mapDeliveryAddress(resolvedAddress)
                }
            }
        )

    /*
     * Marking an already-completed intent should be idempotent.
     */
    await markCheckoutIntentCompleted(
        event,
        cartId,
        payment,
        salesDocument
    )

    return {
        payment: {
            provider:
                'mercado_pago',

            provider_order_id:
                cartId,

            transaction_id:
                String(payment.id),

            transaction_status:
                payment.status,

            status_detail:
                payment.status_detail ?? '',

            amount:
                String(
                    payment.transaction_amount
                ),

            currency:
                payment.currency_id,

            payer_email:
                payment.payer?.email ?? null,

            payer_name: [
                payment.payer?.first_name,
                payment.payer?.last_name
            ]
                .filter(Boolean)
                .join(' '),

            payment_method:
                payment.payment_method_id ?? '',

            payment_type:
                payment.payment_type_id ?? ''
        },

        sales_document:
            salesDocument
    }
}

async function markCheckoutIntentCompleted(
    event: H3Event,
    cartId: string,
    payment: MercadoPagoPayment,
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
                        String(payment.id),

                    document_id:
                        salesDocument.document_id
                }
            }
        )
    } catch (error) {
        /*
         * The order already exists, so do not turn an approved
         * purchase into a customer-facing failure only because
         * the bookkeeping update failed.
         */
        console.error(
            '[Mercado Pago] Unable to update checkout intent:',
            error
        )
    }
}