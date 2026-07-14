import { erpFetch } from '../../../utils/erp'

export default defineEventHandler(async (event) => {
    const cartItemId = getRouterParam(event, 'cart_item_id')

    if (!cartItemId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'cart_item_id is required.'
        })
    }

    return await erpFetch<Record<string, unknown>>(
        event,
        `/api/shopping-cart/items/${encodeURIComponent(cartItemId)}`,
        {
            method: 'DELETE'
        }
    )
})