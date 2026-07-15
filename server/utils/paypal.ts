import type { H3Event } from 'h3'

type PayPalAccessTokenResponse = {
    access_token: string
    token_type: string
    expires_in: number
}

type PayPalRequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: Record<string, unknown>
    requestId?: string
}

function getPayPalBaseUrl(environment: string): string {
    return environment === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
}

async function getPayPalAccessToken(
    event: H3Event
): Promise<string> {
    const config = useRuntimeConfig(event)

    const clientId = String(config.paypalClientId || '')
    const clientSecret = String(config.paypalClientSecret || '')

    if (!clientId || !clientSecret) {
        throw createError({
            statusCode: 500,
            statusMessage: 'PayPal credentials are not configured.'
        })
    }

    const baseUrl = getPayPalBaseUrl(
        String(config.paypalEnvironment)
    )

    const credentials = Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString('base64')

    try {
        const response =
            await $fetch<PayPalAccessTokenResponse>(
                '/v1/oauth2/token',
                {
                    baseURL: baseUrl,

                    method: 'POST',

                    headers: {
                        Authorization: `Basic ${credentials}`,
                        'Content-Type':
                            'application/x-www-form-urlencoded'
                    },

                    body: 'grant_type=client_credentials'
                }
            )

        return response.access_token
    } catch (error: unknown) {
        console.error(
            'Unable to obtain PayPal access token:',
            error
        )

        throw createError({
            statusCode: 502,
            statusMessage:
                'No fue posible conectar con PayPal.'
        })
    }
}

export async function paypalFetch<T>(
    event: H3Event,
    path: string,
    options: PayPalRequestOptions = {}
): Promise<T> {
    const config = useRuntimeConfig(event)

    const accessToken =
        await getPayPalAccessToken(event)

    const baseUrl = getPayPalBaseUrl(
        String(config.paypalEnvironment)
    )

    try {
        return await $fetch<T>(path, {
            baseURL: baseUrl,

            method: options.method ?? 'GET',

            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',

                ...(options.requestId
                    ? {
                        'PayPal-Request-Id':
                            options.requestId
                    }
                    : {})
            },

            body: options.body
        })
    } catch (error: unknown) {
        const fetchError = error as {
            response?: {
                status?: number
                _data?: unknown
            }
            statusCode?: number
            message?: string
        }

        console.error('PayPal request failed:', {
            path,
            status:
                fetchError.response?.status ??
                fetchError.statusCode,
            data:
                fetchError.response?._data ??
                fetchError.message
        })

        throw createError({
            statusCode:
                fetchError.response?.status ||
                fetchError.statusCode ||
                502,

            statusMessage:
                'No fue posible completar la operación con PayPal.',

            data:
                fetchError.response?._data
        })
    }
}