import { erpFetch } from '../../utils/erp'
import { paypalFetch } from '../../utils/paypal'

type DeliveryAddress = {
    name: string
    email: string
    phone: string
    street: string
    exteriorNumber: string
    interiorNumber: string
    neighborhood: string
    postalCode: string
    city: string
    state: string
    reference: string
}

type PayPalOrderRequest = {
    delivery_address: DeliveryAddress
}

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
    const body =
        await readBody<PayPalOrderRequest>(event)

    if (!body?.delivery_address) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'La dirección de entrega es requerida.'
        })
    }

    const cart =
        await erpFetch<CartResponse>(
            event,
            '/api/shopping-cart'
        )

    if (!cart || cart.items.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'El carrito está vacío.'
        })
    }

    /*
     * Persist the checkout data before creating the PayPal order.
     * This allows the webhook to complete the purchase even if
     * the customer never returns to the site.
     */
    await erpFetch(
        event,
        '/api/shopping-cart/checkout-intent',
        {
            method: 'POST',

            body: {
                cart_id:
                    cart.cart_id,

                provider:
                    'paypal',

                delivery_address:
                    body.delivery_address
            }
        }
    )

    const productsTotal =
        Number(cart.totals.total)

    const shippingCost =
        productsTotal >= 2500
            ? 0
            : 1

    const orderTotal =
        productsTotal + shippingCost

    const currency =
        cart.currency?.toUpperCase() ||
        'MXN'

    const order =
        await paypalFetch<PayPalOrderResponse>(
            event,
            '/v2/checkout/orders',
            {
                method: 'POST',

                requestId:
                    `cafe88-${cart.cart_id}-${Date.now()}`,

                body: {
                    intent:
                        'CAPTURE',

                    purchase_units: [
                        {
                            reference_id:
                                cart.cart_id,

                            custom_id:
                                cart.cart_id,

                            description:
                                'Compra Cafe88',

                            amount: {
                                currency_code:
                                    currency,

                                value:
                                    money(orderTotal),

                                breakdown: {
                                    item_total: {
                                        currency_code:
                                            currency,

                                        value:
                                            money(productsTotal)
                                    },

                                    shipping: {
                                        currency_code:
                                            currency,

                                        value:
                                            money(shippingCost)
                                    }
                                }
                            },

                            items:
                                cart.items.map(
                                    item => ({
                                        name:
                                            item.product.short_name
                                                .slice(0, 127),

                                        quantity:
                                            String(item.quantity),

                                        unit_amount: {
                                            currency_code:
                                                currency,

                                            value:
                                                money(
                                                    item.unit_price
                                                )
                                        },

                                        category:
                                            'PHYSICAL_GOODS'
                                    })
                                )
                        }
                    ]
                }
            }
        )

    /*
     * Save the PayPal order ID for diagnostics and recovery.
     */
    await erpFetch(
        event,
        `/api/shopping-cart/checkout-intent/${encodeURIComponent(
            cart.cart_id
        )}`,
        {
            method: 'PATCH',

            body: {
                provider_reference:
                    order.id,

                status:
                    'pending'
            }
        }
    )

    return order
})