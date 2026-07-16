import { erpFetch } from '../../utils/erp'

type DeliveryAddress = {
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

type CheckoutRequest = {
    payment_id: string
    delivery_address: DeliveryAddress
}

type MercadoPagoPayment = {
    id: number
    status: string
    status_detail?: string | null

    transaction_amount: number
    currency_id: string

    external_reference?: string | null

    payment_method_id?: string | null
    payment_type_id?: string | null

    date_created?: string | null
    date_approved?: string | null

    payer?: {
        id?: string | null
        email?: string | null
        first_name?: string | null
        last_name?: string | null
    }

    metadata?: {
        cart_id?: string
        [key: string]: unknown
    }

    [key: string]: unknown
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
    const config = useRuntimeConfig(event)
    const body = await readBody<CheckoutRequest>(event)

    const paymentId = String(
        body?.payment_id ?? ''
    ).trim()

    if (!paymentId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El identificador de Mercado Pago es requerido.'
        })
    }

    if (!/^\d+$/.test(paymentId)) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El identificador de Mercado Pago no es válido.'
        })
    }

    if (!body?.delivery_address) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'La dirección de entrega es requerida.'
        })
    }

    if (!config.mercadoPagoAccessToken) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'Mercado Pago no está configurado.'
        })
    }

    /*
     * Verify the payment directly with Mercado Pago.
     */
    const payment = await $fetch<MercadoPagoPayment>(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(
            paymentId
        )}`,
        {
            method: 'GET',

            headers: {
                Authorization:
                    `Bearer ${config.mercadoPagoAccessToken}`,

                Accept: 'application/json'
            }
        }
    )

    if (payment.status !== 'approved') {
        throw createError({
            statusCode: 409,
            statusMessage:
                'El pago de Mercado Pago no fue aprobado.',

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

    const cartId = String(
        payment.external_reference ??
        payment.metadata?.cart_id ??
        ''
    ).trim()

    if (!cartId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El pago de Mercado Pago no contiene la referencia del carrito.'
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

                    /*
                     * SAT defaults for online payments.
                     *
                     * 31 = Intermediario de pagos
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
                        body.delivery_address
                }
            }
        )

    /*
     * The current cart was processed.
     * Rotate the token so the next visit starts a new cart.
     */
    const newCartToken = crypto.randomUUID()

    setCookie(
        event,
        'cafe88_cart_token',
        newCartToken,
        {
            httpOnly: true,
            sameSite: 'lax',
            secure:
                process.env.NODE_ENV ===
                'production',
            path: '/',
            maxAge:
                60 * 60 * 24 * 30
        }
    )

    return {
        payment: {
            mercado_pago_payment_id:
                String(payment.id),

            status:
                payment.status,

            status_detail:
                payment.status_detail ?? '',

            transaction_id:
                String(payment.id),

            transaction_status:
                payment.status,

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
})