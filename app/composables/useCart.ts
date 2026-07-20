import type {
    AddCartItemPayload,
    ShoppingCart
} from '~/types/cart'

export function useCart() {
    const config = useRuntimeConfig()

    const cart = useState<ShoppingCart | null>(
        'shopping-cart',
        () => null
    )

    const pending = useState<boolean>(
        'shopping-cart-pending',
        () => false
    )

    const errorMessage = useState<string | null>(
        'shopping-cart-error',
        () => null
    )

    const itemCount = computed(() => {
        return Number(cart.value?.total_quantity ?? 0)
    })

    const isEmpty = computed(() => {
        return !cart.value || cart.value.items.length === 0
    })

    async function loadCart() {
        pending.value = true
        errorMessage.value = null

        try {
            cart.value = await $fetch<ShoppingCart | null>(
                '/api/cart'
            )

            return cart.value
        } catch (error) {
            errorMessage.value =
                'No fue posible consultar el carrito.'

            throw error
        } finally {
            pending.value = false
        }
    }

    async function createCart() {
        pending.value = true
        errorMessage.value = null

        try {
            cart.value = await $fetch<ShoppingCart>(
                '/api/cart',
                {
                    method: 'POST'
                }
            )

            return cart.value
        } catch (error) {
            errorMessage.value = 'No fue posible crear el carrito.'

            throw error
        } finally {
            pending.value = false
        }
    }

    async function ensureCart() {
        if (cart.value) {
            return cart.value
        }

        const existingCart = await loadCart()

        if (existingCart) {
            return existingCart
        }

        return await createCart()
    }

    async function addItem(payload: AddCartItemPayload) {
        pending.value = true
        errorMessage.value = null

        try {
            await ensureCart()

            cart.value = await $fetch<ShoppingCart>(
                '/api/cart/items',
                {
                    method: 'POST',
                    body: payload
                }
            )

            return cart.value
        } catch (error) {
            errorMessage.value =
                'No fue posible agregar el producto al carrito.'

            throw error
        } finally {
            pending.value = false
        }
    }

    async function updateItem(
        cartItemId: string,
        quantity: number
    ) {
        pending.value = true
        errorMessage.value = null

        try {
            cart.value = await $fetch<ShoppingCart>(
                `/api/cart/items/${cartItemId}`,
                {
                    method: 'PATCH',
                    body: {
                        quantity
                    }
                }
            )

            return cart.value
        } catch (error) {
            errorMessage.value =
                'No fue posible actualizar el producto.'

            throw error
        } finally {
            pending.value = false
        }
    }

    async function removeItem(cartItemId: string) {
        if (!cartItemId) {
            throw new Error('cart_item_id is required')
        }

        pending.value = true
        errorMessage.value = null

        try {
            const updatedCart = await $fetch<ShoppingCart>(
                `/api/cart/items/${encodeURIComponent(cartItemId)}`,
                {
                    method: 'DELETE'
                }
            )

            cart.value = updatedCart

            return updatedCart
        } catch (error) {
            errorMessage.value =
                'No fue posible eliminar el producto.'

            throw error
        } finally {
            pending.value = false
        }
    }

    async function clearCart() {
        pending.value = true
        errorMessage.value = null

        try {
            await $fetch('/api/cart', {
                method: 'DELETE'
            })

            cart.value = null
        } catch (error) {
            errorMessage.value =
                'No fue posible vaciar el carrito.'

            throw error
        } finally {
            pending.value = false
        }
    }

    function resetCartState() {
        cart.value = null
        errorMessage.value = null
    }

    return {
        cart,
        pending,
        errorMessage,
        itemCount,
        isEmpty,
        loadCart,
        createCart,
        ensureCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        resetCartState
    }


}