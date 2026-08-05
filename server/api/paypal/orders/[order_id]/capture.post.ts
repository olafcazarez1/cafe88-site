import crypto from 'node:crypto'

import { paypalFetch } from '../../../../utils/paypal'

import {
    processPayPalCheckout,
    type DeliveryAddress
} from '../../../../utils/process-paypal-checkout'

type CaptureRequestBody = {
    delivery_address: DeliveryAddress
}

type PayPalCaptureResponse = {
    id: string
    status: string

    purchase_units?: Array<{
        payments?: {
            captures?: Array<{
                id: string
                status: string

                amount: {
                    currency_code: string
                    value: string
                }
            }>
        }
    }>
}

export default defineEventHandler(async (event) => {
    const orderId = String(getRouterParam(event, 'order_id') ?? '').trim()

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
     * Capture the approved PayPal order.
     */
    const capture =
        await paypalFetch<PayPalCaptureResponse>(
            event,
            `/v2/checkout/orders/${encodeURIComponent(
                orderId
            )}/capture`,
            {
                method: 'POST',
                requestId:
                    `cafe88-capture-${orderId}`
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
     * Both the browser return and the webhook use the same
     * processing pipeline.
     */
    const completed =
        await processPayPalCheckout({
            event,
            captureId:
                transaction.id,
            orderId,
            deliveryAddress:
                body.delivery_address
        })

    /*
     * Browser-only behavior.
     * A webhook cannot rotate the customer's browser cookie.
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