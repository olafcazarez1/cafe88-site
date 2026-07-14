import { erpFetch } from '../../utils/erp'

type AddCartItemBody = {
    product_id: string
    measure_id: string
    quantity: number
}

export default defineEventHandler(async (event) => {
    const body = await readBody<AddCartItemBody>(event)

    if (!body?.product_id || !body?.measure_id) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'product_id and measure_id are required.'
        })
    }

    const quantity = Number(body.quantity)

    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Quantity must be greater than zero.'
        })
    }

    return await erpFetch<Record<string, unknown>>(
        event,
        '/api/shopping-cart/items',
        {
            method: 'POST',

            body: {
                product_id: body.product_id,
                measure_id: body.measure_id,
                quantity
            }
        }
    )
})