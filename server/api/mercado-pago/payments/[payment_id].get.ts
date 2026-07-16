type MercadoPagoPayment = {
    id: number
    status: string
    status_detail: string | null

    transaction_amount: number
    currency_id: string

    external_reference: string | null

    payment_method_id: string | null
    payment_type_id: string | null

    date_created: string | null
    date_approved: string | null

    payer?: {
        id?: string | null
        email?: string | null
        first_name?: string | null
        last_name?: string | null
    }

    metadata?: Record<string, unknown>

    transaction_details?: {
        net_received_amount?: number
        total_paid_amount?: number
        installment_amount?: number
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)

    const paymentId = getRouterParam(
        event,
        'payment_id'
    )

    if (!paymentId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Mercado Pago payment ID is required'
        })
    }

    if (!/^\d+$/.test(paymentId)) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Invalid Mercado Pago payment ID'
        })
    }

    if (!config.mercadoPagoAccessToken) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'Mercado Pago access token is not configured'
        })
    }

    try {
        const payment =
            await $fetch<MercadoPagoPayment>(
                `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
                {
                    method: 'GET',

                    headers: {
                        Authorization:
                            `Bearer ${config.mercadoPagoAccessToken}`,

                        Accept: 'application/json'
                    }
                }
            )

        return {
            provider: 'mercado_pago',

            provider_order_id:
                payment.external_reference ?? '',

            provider_transaction_id:
                String(payment.id),

            provider_status:
                payment.status,

            provider_status_detail:
                payment.status_detail ?? '',

            amount:
                Number(payment.transaction_amount),

            currency:
                payment.currency_id,

            payer_email:
                payment.payer?.email ?? null,

            payment_method:
                payment.payment_method_id ?? '',

            payment_type:
                payment.payment_type_id ?? '',

            date_created:
                payment.date_created,

            date_approved:
                payment.date_approved,

            external_reference:
                payment.external_reference ?? '',

            approved:
                payment.status === 'approved',

            provider_data:
                payment
        }
    } catch (error: any) {
        const mercadoPagoError =
            error?.response?._data ??
            error?.data ??
            error

        console.error(
            'Unable to verify Mercado Pago payment:',
            JSON.stringify(
                mercadoPagoError,
                null,
                2
            )
        )

        throw createError({
            statusCode:
                error?.response?.status ??
                error?.statusCode ??
                502,

            statusMessage:
                mercadoPagoError?.message ??
                mercadoPagoError?.error ??
                'No fue posible verificar el pago con Mercado Pago',

            data:
                mercadoPagoError
        })
    }
})