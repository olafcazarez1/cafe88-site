import { erpFetch } from '../../../../utils/erp'
import { paypalFetch } from '../../../../utils/paypal'

type DeliveryAddress = {
    name: string
    email: string
    phone: string
    street: string
    exterior_number: string
    interior_number?: string
    neighborhood: string
    postal_code: string
    reference?: string
}

type CaptureRequestBody = {
    delivery_address: DeliveryAddress
}

type PayPalCaptureResponse = {
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
        payments?: {
            captures?: Array<{
                id: string
                status: string

                amount: {
                    currency_code: string
                    value: string
                }

                create_time?: string
                update_time?: string
            }>
        }
    }>
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

export default defineEventHandler(async (event) => {
    const orderId = getRouterParam(event, 'order_id')

    if (!orderId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El identificador de PayPal es requerido.'
        })
    }

    const body = await readBody<CaptureRequestBody>(event)

    if (!body?.delivery_address) {
        throw createError({
            statusCode: 400,
            statusMessage: 'La dirección de entrega es requerida.'
        })
    }

    /*
     * Capture PayPal payment.
     */
    const capture = await paypalFetch<PayPalCaptureResponse>(
        event,
        `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
        {
            method: 'POST',
            requestId: `cafe88-capture-${orderId}`
        }
    )

    if (capture.status !== 'COMPLETED') {
        throw createError({
            statusCode: 409,
            statusMessage: 'El pago de PayPal no fue completado.',
            data: capture
        })
    }

    const transaction =
        capture.purchase_units?.[0]
            ?.payments?.captures?.[0]

    if (!transaction?.id) {
        throw createError({
            statusCode: 502,
            statusMessage:
                'PayPal completó el pago, pero no devolvió la transacción.'
        })
    }

    if (transaction.status !== 'COMPLETED') {
        throw createError({
            statusCode: 409,
            statusMessage:
                'La transacción de PayPal no fue completada.',
            data: capture
        })
    }

    /*
     * Convert the active cart into:
     *
     * - sales document
     * - details and taxes
     * - shipping service
     * - delivery address
     * - payment
     */
    const salesDocument =
        await erpFetch<ErpCheckoutResponse>(
            event,
            '/api/shopping-cart/checkout',
            {
                method: 'POST',

                body: {
                    payment: {
                        provider: 'paypal',

                        provider_order_id: capture.id,

                        provider_transaction_id:
                            transaction.id,

                        provider_status:
                            transaction.status,

                        amount:
                            Number(transaction.amount.value),

                        currency:
                            transaction.amount.currency_code,

                        provider_data: capture
                    },

                    delivery_address:
                        body.delivery_address
                }
            }
        )

    const newCartToken = crypto.randomUUID()

    setCookie(
        event,
        'cafe88_cart_token',
        newCartToken,
        {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30
        }
    )

    return {
        payment: {
            provider_order_id: capture.id,

            status: capture.status,

            transaction_id:
                transaction.id,

            transaction_status:
                transaction.status,

            amount:
                transaction.amount.value,

            currency:
                transaction.amount.currency_code,

            payer_email:
                capture.payer?.email_address ?? null,

            payer_name: [
                capture.payer?.name?.given_name,
                capture.payer?.name?.surname
            ]
                .filter(Boolean)
                .join(' ')
        },

        sales_document: salesDocument
    }
})