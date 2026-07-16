import crypto from 'node:crypto'
import type { H3Event } from 'h3'

export type MercadoPagoPayment = {
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

export async function getMercadoPagoPayment(
    event: H3Event,
    paymentId: string
): Promise<MercadoPagoPayment> {
    const config = useRuntimeConfig(event)

    if (!config.mercadoPagoAccessToken) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'Mercado Pago no está configurado.'
        })
    }

    return await $fetch<MercadoPagoPayment>(
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
}

export function getMercadoPagoCartId(
    payment: MercadoPagoPayment
): string {
    return String(
        payment.external_reference ??
        payment.metadata?.cart_id ??
        ''
    ).trim()
}

type SignatureParts = {
    ts: string
    v1: string
}

function parseSignature(
    signature: string
): SignatureParts | null {
    const values: Record<string, string> = {}

    for (const part of signature.split(',')) {
        const [key, value] = part.split('=', 2)

        if (key && value) {
            values[key.trim()] = value.trim()
        }
    }

    if (!values.ts || !values.v1) {
        return null
    }

    return {
        ts: values.ts,
        v1: values.v1
    }
}

export function validateMercadoPagoWebhookSignature(
    event: H3Event,
    dataId: string
): void {
    const config = useRuntimeConfig(event)

    const secret = String(
        config.mercadoPagoWebhookSecret ?? ''
    ).trim()

    if (!secret) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'Mercado Pago webhook secret is not configured.'
        })
    }

    const xSignature =
        getRequestHeader(event, 'x-signature') ?? ''

    const xRequestId =
        getRequestHeader(event, 'x-request-id') ?? ''

    const parsed = parseSignature(xSignature)

    if (!parsed || !xRequestId || !dataId) {
        throw createError({
            statusCode: 401,
            statusMessage:
                'Invalid Mercado Pago webhook signature.'
        })
    }

    const normalizedDataId =
        dataId.toLowerCase()

    const manifest =
        `id:${normalizedDataId};` +
        `request-id:${xRequestId};` +
        `ts:${parsed.ts};`

    const expected = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex')

    const receivedBuffer =
        Buffer.from(parsed.v1, 'hex')

    const expectedBuffer =
        Buffer.from(expected, 'hex')

    if (
        receivedBuffer.length !==
        expectedBuffer.length
    ) {
        throw createError({
            statusCode: 401,
            statusMessage:
                'Invalid Mercado Pago webhook signature.'
        })
    }

    if (
        !crypto.timingSafeEqual(
            receivedBuffer,
            expectedBuffer
        )
    ) {
        throw createError({
            statusCode: 401,
            statusMessage:
                'Invalid Mercado Pago webhook signature.'
        })
    }
}