import { erpFetch } from '../../../utils/erp'

type UpdateCartItemBody = {
    quantity: number
}

export default defineEventHandler(async (event) => {
    const cartItemId = getRouterParam(
        event,
        'cart_item_id',
        {
            decode: true
        }
    )

    if (!cartItemId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'cart_item_id is required.'
        })
    }

    const body = await readBody<UpdateCartItemBody>(event)
    const quantity = Number(body?.quantity)

    if (!Number.isFinite(quantity) || quantity < 0) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Quantity must be zero or greater.'
        })
    }

    return await erpFetch<Record<string, unknown>>(
        event,
        `/api/shopping-cart/items/${encodeURIComponent(cartItemId)}`,
        {
            method: 'PATCH',
            body: {
                quantity
            }
        }
    )
})