import { erpFetch } from '../../utils/erp'

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

    return await erpFetch<Record<string, unknown>>(
        event,
        '/api/shopping-cart',
        {
            method: 'POST',
            body: {
                branch_id: String(config.erpBranchId),
                warehouse_id: String(config.erpWarehouseId),
                client_id: String(config.erpClientId),
                currency: 'mxn',
                exchange_rate: 1
            }
        }
    )
})