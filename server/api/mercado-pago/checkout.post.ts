import crypto from 'node:crypto'

import {
    processMercadoPagoCheckout,
    type DeliveryAddress
} from '../../utils/process-mercado-pago-checkout'

type CheckoutRequest = {
    payment_id: string
    delivery_address: DeliveryAddress
}

export default defineEventHandler(async (event) => {
    const body =
        await readBody<CheckoutRequest>(event)

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

    if (!body?.delivery_address) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'La dirección de entrega es requerida.'
        })
    }

    const completed =
        await processMercadoPagoCheckout({
            event,
            paymentId,

            deliveryAddress:
                body.delivery_address
        })

    /*
     * Browser-only behavior.
     * A webhook cannot and does not need to rotate this cookie.
     */
    setCookie(
        event,
        'cafe88_cart_token',
        crypto.randomUUID(),
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

    return completed
})