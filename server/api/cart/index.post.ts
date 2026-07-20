import { erpFetch } from '../../utils/erp'
import { renewCartToken } from '~~/server/utils/cart-token'

declare module 'h3' {
    interface H3EventContext {
        cartToken?: string
    }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)

    if (
        !config.erpBranchId ||
        !config.erpWarehouseId ||
        !config.erpClientId
    ) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Cart configuration is incomplete.'
        })
    }

    const body = {
        branch_id: String(config.erpBranchId),
        warehouse_id: String(config.erpWarehouseId),
        client_id: String(config.erpClientId),
        currency: 'mxn',
        exchange_rate: 1
    }

    try {
        return await erpFetch<Record<string, unknown>>(
            event,
            '/api/shopping-cart',
            {
                method: 'POST',
                body
            }
        )
    } catch (error: unknown) {
        const statusCode =
            error && typeof error === 'object' &&
                'statusCode' in error
                ? Number(error.statusCode)
                : 500

        if (statusCode !== 409) {
            throw error
        }

        renewCartToken(event)

        return await erpFetch<Record<string, unknown>>(
            event,
            '/api/shopping-cart',
            {
                method: 'POST',
                body
            }
        )
    }
})