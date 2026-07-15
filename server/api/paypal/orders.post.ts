import { erpFetch } from '../../utils/erp'
import { paypalFetch } from '../../utils/paypal'

type CartResponse = {
    cart_id: string
    currency: string

    items: Array<{
        product: {
            short_name: string
        }
        quantity: number
        unit_price: number
    }>

    totals: {
        total: number
    }
}

type PayPalOrderResponse = {
    id: string
    status: string
}

function money(value: number): string {
    return Number(value).toFixed(2)
}

export default defineEventHandler(async (event) => {
    const cart = await erpFetch<CartResponse>(
        event,
        '/api/shopping-cart'
    )

    if (!cart || cart.items.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El carrito está vacío.'
        })
    }

    const productsTotal = Number(cart.totals.total)
    const shippingCost = productsTotal >= 2500 ? 0 : 130
    const orderTotal = productsTotal + shippingCost
    const currency = cart.currency?.toUpperCase() || 'MXN'

    return await paypalFetch<PayPalOrderResponse>(
        event,
        '/v2/checkout/orders',
        {
            method: 'POST',
            requestId: `cafe88-${cart.cart_id}-${Date.now()}`,

            body: {
                intent: 'CAPTURE',

                purchase_units: [
                    {
                        reference_id: cart.cart_id,
                        description: 'Compra Cafe88',

                        amount: {
                            currency_code: currency,
                            value: money(orderTotal),

                            breakdown: {
                                item_total: {
                                    currency_code: currency,
                                    value: money(productsTotal)
                                },

                                shipping: {
                                    currency_code: currency,
                                    value: money(shippingCost)
                                }
                            }
                        },

                        items: cart.items.map(item => ({
                            name: item.product.short_name.slice(0, 127),
                            quantity: String(item.quantity),

                            unit_amount: {
                                currency_code: currency,
                                value: money(item.unit_price)
                            },

                            category: 'PHYSICAL_GOODS'
                        }))
                    }
                ]
            }
        }
    )
})