import type { H3Event } from 'h3'
import type { FetchOptions } from 'ofetch'

import { getOrCreateCartToken } from './cart-token'

type ErpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type ErpFetchOptions = {
    method?: ErpMethod
    body?: Record<string, unknown> | null
    query?: Record<string, string | number | boolean | undefined>
}

export async function erpFetch<T>(
    event: H3Event,
    path: string,
    options: ErpFetchOptions = {}
): Promise<T> {
    const config = useRuntimeConfig(event)
    const cartToken = getOrCreateCartToken(event)

    if (!config.erpBaseUrl) {
        throw createError({
            statusCode: 500,
            statusMessage: 'ERP base URL is not configured.'
        })
    }

    if (!config.erpApiToken) {
        throw createError({
            statusCode: 500,
            statusMessage: 'ERP API token is not configured.'
        })
    }

    const fetchOptions: FetchOptions<'json'> = {
        baseURL: String(config.erpBaseUrl).replace(/\/$/, ''),
        method: options.method ?? 'GET',

        headers: {
            Authorization: String(config.erpApiToken),
            'X-Cart-Token': cartToken,
            Accept: 'application/json'
        },

        query: options.query
    }

    if (options.body !== undefined && options.body !== null) {
        fetchOptions.body = options.body
    }

    try {
        return await $fetch<T>(path, fetchOptions)
    } catch (error: unknown) {
        const fetchError = error as {
            response?: {
                status?: number
                _data?: unknown
            }
            statusCode?: number
            statusMessage?: string
            data?: unknown
            message?: string
        }

        const statusCode =
            fetchError.response?.status ??
            fetchError.statusCode ??
            502

        const responseData =
            fetchError.response?._data ??
            fetchError.data ??
            fetchError.message

        console.error('ERP request failed:', {
            path,
            method: options.method ?? 'GET',
            statusCode,
            data: responseData
        })

        throw createError({
            statusCode,
            statusMessage:
                fetchError.statusMessage ||
                getErpErrorMessage(statusCode),

            data: responseData
        })
    }
}

function getErpErrorMessage(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return 'La solicitud enviada al ERP no es válida.'

        case 401:
        case 403:
            return 'No fue posible autorizar la solicitud al ERP.'

        case 404:
            return 'El recurso solicitado no fue encontrado.'

        case 409:
            return 'No fue posible completar la operación por un conflicto.'

        default:
            return 'No fue posible completar la operación con el ERP.'
    }
}