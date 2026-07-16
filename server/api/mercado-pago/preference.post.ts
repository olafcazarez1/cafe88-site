import {
    MercadoPagoConfig,
    Preference
} from 'mercadopago'

type PreferenceCartItem = {
    product_id: string
    name: string
    quantity: number
    price: number
}

type PreferenceRequest = {
    cart_id: string
    items: PreferenceCartItem[]
    shipping: number
    payer: {
        name: string
        email: string
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const body = await readBody<PreferenceRequest>(event)

    if (!config.mercadoPagoAccessToken) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'Mercado Pago access token is not configured'
        })
    }

    if (!body.cart_id || !body.items?.length) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Cart and items are required'
        })
    }

    const client = new MercadoPagoConfig({
        accessToken: config.mercadoPagoAccessToken
    })

    const preference = new Preference(client)

    const items = body.items.map((item) => ({
        id: item.product_id,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'MXN'
    }))

    if (Number(body.shipping) > 0) {
        items.push({
            id: 'shipping',
            title: 'Costo de envío',
            quantity: 1,
            unit_price: Number(body.shipping),
            currency_id: 'MXN'
        })
    }

    const baseUrl =
        config.mercadoPagoBaseUrl ||
        getRequestURL(event).origin

    try {
        const response = await preference.create({
            body: {
                items,

                payer: {
                    name: body.payer.name,
                    email: body.payer.email
                },

                external_reference: body.cart_id,

                back_urls: {
                    success:
                        `${baseUrl}/checkout/mercado-pago/success`,
                    pending:
                        `${baseUrl}/checkout/mercado-pago/pending`,
                    failure:
                        `${baseUrl}/checkout/mercado-pago/failure`
                },

                // auto_return: 'approved',

                metadata: {
                    cart_id: body.cart_id
                },

                statement_descriptor: 'CAFE88'
            }
        })

        return {
            preference_id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        }
    } catch (error: any) {
        const statusCode =
            error?.response?.status ??
            error?.statusCode ??
            502

        const mercadoPagoError =
            error?.response?._data ??
            error?.data ??
            error

        console.error(
            'Mercado Pago preference creation failed:',
            JSON.stringify(mercadoPagoError, null, 2)
        )

        throw createError({
            statusCode,
            statusMessage:
                mercadoPagoError?.message ??
                mercadoPagoError?.error ??
                'No fue posible iniciar el pago con Mercado Pago',

            data: mercadoPagoError
        })
    }
})