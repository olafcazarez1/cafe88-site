<template>
    <div>
        <header class="mb-4">
            <span class="products-eyebrow">
                Tu compra
            </span>

            <h1 class="fw-bold mt-2">
                Carrito
            </h1>
        </header>

        <div v-if="pending" class="products-state">
            Cargando carrito...
        </div>

        <div v-else-if="isEmpty" class="products-state">
            <h2 class="h4">
                Tu carrito está vacío
            </h2>

            <p class="text-muted">
                Agrega productos para comenzar tu compra.
            </p>

            <NuxtLink to="/products" class="btn btn-cafe88">
                Ver productos
            </NuxtLink>
        </div>

        <div v-else-if="cart" class="row g-4">
            <div class="col-lg-8">

                <!-- Delivery address -->
                <section class="checkout-section-card mb-4">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-2">

                                <h2 class="h4 fw-bold mb-0">
                                    <span class="checkout-step mb-0">1</span> Dirección de entrega
                                </h2>
                            </div>

                            <p class="text-muted mb-0">
                                Captura los datos donde deseas recibir tu pedido.
                            </p>
                        </div>

                        <button type="button" class="btn btn-outline-dark" data-bs-toggle="modal"
                            data-bs-target="#deliveryAddressModal">
                            {{ hasDeliveryAddress ? 'Editar dirección' : 'Agregar dirección' }}
                        </button>
                    </div>

                    <div v-if="hasDeliveryAddress" class="delivery-address-summary mt-4">
                        <strong>
                            {{ deliveryAddress.name }}
                        </strong>

                        <p class="mb-1">
                            {{ deliveryAddress.street }}
                            {{ deliveryAddress.exteriorNumber }}

                            <template v-if="deliveryAddress.interiorNumber">
                                Int. {{ deliveryAddress.interiorNumber }}
                            </template>
                        </p>

                        <p class="mb-1">
                            {{ deliveryAddress.neighborhood }},
                            C.P. {{ deliveryAddress.postalCode }}
                        </p>

                        <p class="mb-1">
                            {{ deliveryAddress.city }},
                            {{ deliveryAddress.state }}
                        </p>

                        <p class="mb-1">
                            {{ deliveryAddress.phone }}
                        </p>

                        <p class="mb-0">
                            {{ deliveryAddress.email }}
                        </p>
                    </div>

                    <div v-else class="delivery-address-empty mt-4">
                        Aún no has agregado una dirección de entrega.
                    </div>
                </section>

                <!-- Payment methods -->
                <section class="checkout-section-card mb-4">
                    <div class="checkout-section-header">
                        <div>


                            <h2 class="h4 fw-bold mb-1">
                                <span class="checkout-step">2</span> Método de pago
                            </h2>

                            <p class="text-muted mb-0">
                                Selecciona cómo deseas pagar tu pedido.
                            </p>
                        </div>
                    </div>

                    <div class="payment-methods mt-4">
                        <label class="payment-method-card" :class="{
                            'is-selected': paymentMethod === 'paypal'
                        }">
                            <input v-model="paymentMethod" type="radio" name="payment_method" value="paypal">

                            <div>
                                <strong>PayPal</strong>

                                <p class="text-muted small mb-0">
                                    Paga con tu cuenta PayPal.
                                </p>
                            </div>
                        </label>

                        <label class="payment-method-card" :class="{
                            'is-selected': paymentMethod === 'mercado_pago'
                        }">
                            <input v-model="paymentMethod" type="radio" name="payment_method" value="mercado_pago">

                            <div>
                                <strong>Tarjeta de crédito o débito</strong>

                                <p class="text-muted small mb-0">
                                    Procesado de forma segura por Mercado Pago.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div v-if="paymentMethod" class="alert alert-light border mt-3 mb-0">
                        Integración de pago pendiente para la siguiente etapa.
                    </div>
                </section>

                <!-- Cart products -->
                <section class="checkout-section-card">

                    <div class="checkout-section-header">
                        <div>


                            <h2 class="h4 fw-bold mb-1">
                                <span class="checkout-step">3</span> Products
                            </h2>

                            <p class="text-muted mb-0">
                                Selecciona cómo deseas pagar tu pedido.
                            </p>
                        </div>
                    </div>

                    <article v-for="item in cart.items" :key="item.cart_item_id" class="cart-item-card">
                        <img :src="productImage(item.product.image)" :alt="item.product.short_name"
                            class="cart-item-image">

                        <div class="cart-item-content">
                            <h3 class="h5 mb-1">
                                {{ item.product.short_name }}
                            </h3>

                            <p class="text-muted small mb-2">
                                {{ item.measure.name }}
                            </p>

                            <p class="fw-bold mb-3">
                                {{ formatMoney(item.unit_price, item.currency) }}
                            </p>

                            <div class="d-flex align-items-center gap-2">
                                <input :value="item.quantity" type="number" min="1" max="10"
                                    class="form-control cart-quantity-input" @change="changeQuantity(
                                        item.cart_item_id,
                                        Number(($event.target as HTMLInputElement).value)
                                    )">

                                <button type="button" class="btn btn-link text-danger p-0"
                                    :disabled="removingItemId === item.cart_item_id"
                                    @click.stop="handleRemoveItem(item.cart_item_id)">
                                    <span v-if="removingItemId === item.cart_item_id"
                                        class="spinner-border spinner-border-sm me-1" aria-hidden="true" />

                                    {{
                                        removingItemId === item.cart_item_id
                                            ? 'Eliminando...'
                                            : 'Eliminar'
                                    }}
                                </button>
                                <div v-if="cartActionError" class="alert alert-danger">
                                    {{ cartActionError }}
                                </div>
                            </div>
                        </div>

                        <div class="cart-item-total">
                            {{ formatMoney(item.line_total, item.currency) }}
                        </div>
                    </article>
                </section>
            </div>

            <!-- Summary -->
            <div class="col-lg-4">
                <aside class="cart-summary-card">
                    <h2 class="h4 fw-bold mb-4">
                        Resumen
                    </h2>

                    <div class="cart-summary-row">
                        <span>Productos</span>

                        <span>
                            {{ formatMoney(cart.totals.subtotal, cart.currency) }}
                        </span>
                    </div>

                    <div v-if="cart.totals.discount > 0" class="cart-summary-row">
                        <span>Descuento</span>

                        <span>
                            -{{ formatMoney(cart.totals.discount, cart.currency) }}
                        </span>
                    </div>

                    <div class="cart-summary-row">
                        <span>IVA incluido</span>

                        <span>
                            {{ formatMoney(cart.totals.tax, cart.currency) }}
                        </span>
                    </div>

                    <div class="cart-summary-row">
                        <div>
                            <span>Envío</span>

                            <small v-if="shippingCost > 0" class="d-block text-muted">
                                Gratis en compras desde $2,500 MXN
                            </small>

                            <small v-else class="d-block text-success">
                                Envío gratis aplicado
                            </small>
                        </div>

                        <span>
                            <template v-if="shippingCost > 0">
                                {{ formatMoney(shippingCost, cart.currency) }}
                            </template>

                            <template v-else>
                                <strong class="text-success">
                                    Gratis
                                </strong>
                            </template>
                        </span>
                    </div>
                    <div v-if="amountForFreeShipping > 0" class="alert alert-light border small mt-3">
                        Agrega
                        <strong>
                            {{ formatMoney(amountForFreeShipping, cart.currency) }}
                        </strong>
                        más para obtener envío gratis.
                    </div>

                    <hr>

                    <div class="cart-summary-row cart-summary-total">
                        <span>Total</span>

                        <span>
                            {{ formatMoney(grandTotal, cart.currency) }}
                        </span>
                    </div>

                    <button type="button" class="btn btn-cafe88 btn-lg w-100 mt-4" :disabled="!canContinueCheckout"
                        @click="continueCheckout">
                        Continuar con el pago
                    </button>
                    <div v-if="checkoutError" class="alert alert-danger py-2 mt-3 mb-0">
                        {{ checkoutError }}
                    </div>

                    <p class="small text-muted mt-3 mb-0">
                        El cálculo real de envío y el pago estarán disponibles
                        próximamente.
                    </p>
                </aside>
            </div>
        </div>
        <div id="deliveryAddressModal" class="modal fade" tabindex="-1" aria-labelledby="deliveryAddressModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="deliveryAddressModalLabel" class="modal-title fs-5">
                            Dirección de entrega
                        </h2>

                        <button ref="addressModalCloseButton" type="button" class="btn-close" data-bs-dismiss="modal"
                            aria-label="Cerrar" />
                    </div>

                    <form @submit.prevent="saveDeliveryAddress">
                        <div class="modal-body">
                            <div class="row g-3">

                                <!-- Full name -->
                                <div class="col-12">
                                    <label for="delivery-name" class="form-label">
                                        Nombre completo
                                    </label>

                                    <input id="delivery-name" v-model.trim="deliveryAddress.name" type="text"
                                        class="form-control" autocomplete="name" required>
                                </div>

                                <!-- Email and phone -->
                                <div class="col-md-6">
                                    <label for="delivery-email" class="form-label">
                                        Correo electrónico
                                    </label>

                                    <input id="delivery-email" v-model.trim="deliveryAddress.email" type="email"
                                        class="form-control" autocomplete="email" required>
                                </div>

                                <div class="col-md-6">
                                    <label for="delivery-phone" class="form-label">
                                        Teléfono
                                    </label>

                                    <input id="delivery-phone" v-model.trim="deliveryAddress.phone" type="tel"
                                        class="form-control" autocomplete="tel" required>
                                </div>

                                <!-- Street and numbers -->
                                <div class="col-md-6">
                                    <label for="delivery-street" class="form-label">
                                        Calle
                                    </label>

                                    <input id="delivery-street" v-model.trim="deliveryAddress.street" type="text"
                                        class="form-control" autocomplete="address-line1" required>
                                </div>

                                <div class="col-md-3">
                                    <label for="delivery-exterior" class="form-label">
                                        No. exterior
                                    </label>

                                    <input id="delivery-exterior" v-model.trim="deliveryAddress.exteriorNumber"
                                        type="text" class="form-control" required>
                                </div>

                                <div class="col-md-3">
                                    <label for="delivery-interior" class="form-label">
                                        Interior
                                    </label>

                                    <input id="delivery-interior" v-model.trim="deliveryAddress.interiorNumber"
                                        type="text" class="form-control" autocomplete="address-line2">
                                </div>

                                <!-- Postal code and neighborhood -->
                                <div class="col-md-4">
                                    <label for="delivery-postal-code" class="form-label">
                                        Código postal
                                    </label>

                                    <div class="input-group">
                                        <input id="delivery-postal-code" v-model="deliveryAddress.postalCode"
                                            type="text" inputmode="numeric" maxlength="5" pattern="[0-9]{5}"
                                            class="form-control" autocomplete="postal-code" required
                                            @input="onPostalCodeInput" @blur="searchPostalCode">

                                        <button type="button" class="btn btn-outline-secondary" :disabled="postalCodeLoading ||
                                            deliveryAddress.postalCode.length !== 5
                                            " @click="searchPostalCode">
                                            <span v-if="postalCodeLoading" class="spinner-border spinner-border-sm"
                                                aria-hidden="true" />

                                            <span v-else>
                                                Buscar
                                            </span>
                                        </button>
                                    </div>

                                    <div v-if="postalCodeError" class="text-danger small mt-1">
                                        {{ postalCodeError }}
                                    </div>
                                </div>

                                <div class="col-md-8">
                                    <label for="delivery-neighborhood" class="form-label">
                                        Colonia
                                    </label>

                                    <select id="delivery-neighborhood" v-model="deliveryAddress.neighborhood"
                                        class="form-select" :disabled="postalCodeLoading ||
                                            neighborhoodOptions.length === 0
                                            " required>
                                        <option value="">
                                            {{
                                                postalCodeLoading
                                                    ? 'Consultando código postal...'
                                                    : neighborhoodOptions.length
                                                        ? 'Selecciona una colonia'
                                                        : 'Primero consulta un código postal válido'
                                            }}
                                        </option>

                                        <option v-for="item in neighborhoodOptions" :key="item.neighborhood_id"
                                            :value="item.name">
                                            {{ item.name }}
                                        </option>
                                    </select>
                                </div>

                                <!-- Read-only location data -->
                                <div class="col-md-6">
                                    <label for="delivery-city" class="form-label">
                                        Ciudad / Municipio
                                    </label>

                                    <input id="delivery-city" v-model="deliveryAddress.city" type="text"
                                        class="form-control" readonly required>
                                </div>

                                <div class="col-md-6">
                                    <label for="delivery-state" class="form-label">
                                        Estado
                                    </label>

                                    <input id="delivery-state" v-model="deliveryAddress.state" type="text"
                                        class="form-control" readonly required>
                                </div>

                                <!-- Delivery references -->
                                <div class="col-12">
                                    <label for="delivery-reference" class="form-label">
                                        Referencias
                                    </label>

                                    <textarea id="delivery-reference" v-model.trim="deliveryAddress.reference"
                                        class="form-control" rows="3"
                                        placeholder="Entre calles, color de la casa, referencias..." />
                                </div>

                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>

                            <button type="submit" class="btn btn-cafe88">
                                Guardar dirección
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const DELIVERY_ADDRESS_STORAGE_KEY = 'cafe88_delivery_address'
const PAYMENT_METHOD_STORAGE_KEY = 'cafe88_payment_method'

const {
    cart,
    pending,
    isEmpty,
    loadCart,
    updateItem,
    removeItem: removeCartItem
} = useCart()

const removingItemId = ref<string | null>(null)
const cartActionError = ref('')

await loadCart()

onMounted(async () => {
    restoreDeliveryAddress()
    restorePaymentMethod()

    if (
        deliveryAddress.postalCode.length === 5 &&
        deliveryAddress.neighborhood
    ) {
        await searchPostalCode({
            preserveNeighborhood: true
        })
    }
})

const deliveryAddress = reactive({
    name: '',
    email: '',
    phone: '',
    street: '',
    exteriorNumber: '',
    interiorNumber: '',
    neighborhood: '',
    postalCode: '',
    city: '',
    state: '',
    reference: ''
})

type NeighborhoodOption = {
    neighborhood_id: string
    zip: string
    name: string
}

type PostalCodeResponse = {
    zip: string
    border_zone: boolean

    state: {
        state_id: string
        name: string
    } | null

    municipality: {
        state_id: string
        municipality_id: string
        name: string
    } | null

    locality: {
        locality_id: string
        name: string
    } | null

    neighborhoods: NeighborhoodOption[]
}

const hasDeliveryAddress = ref(false)

const neighborhoodOptions = ref<NeighborhoodOption[]>([])
const postalCodeLoading = ref(false)
const postalCodeError = ref('')

const addressModalCloseButton =
    ref<HTMLButtonElement | null>(null)

async function saveDeliveryAddress() {
    if (deliveryAddress.postalCode.length !== 5) {
        postalCodeError.value =
            'Captura un código postal válido.'

        return
    }

    if (
        !deliveryAddress.state ||
        !deliveryAddress.city ||
        !deliveryAddress.neighborhood
    ) {
        await searchPostalCode({
            preserveNeighborhood: true
        })

        if (
            !deliveryAddress.state ||
            !deliveryAddress.city ||
            !deliveryAddress.neighborhood
        ) {
            return
        }
    }

    localStorage.setItem(
        DELIVERY_ADDRESS_STORAGE_KEY,
        JSON.stringify({
            ...deliveryAddress
        })
    )

    hasDeliveryAddress.value = true

    calculateDummyShipping()

    addressModalCloseButton.value?.click()
}

const paymentMethod = ref('')

watch(paymentMethod, value => {
    if (!import.meta.client) {
        return
    }

    if (!value) {
        localStorage.removeItem(
            PAYMENT_METHOD_STORAGE_KEY
        )

        return
    }

    localStorage.setItem(
        PAYMENT_METHOD_STORAGE_KEY,
        value
    )
})

const shippingCost = ref(0)
const checkoutError = ref('')

const hasPostalCode = computed(() => {
    return deliveryAddress.postalCode.trim().length === 5
})

const grandTotal = computed(() => {
    return Number(cart.value?.totals.total ?? 0) +
        Number(shippingCost.value)
})

const canContinueCheckout = computed(() => {
    return Boolean(
        cart.value &&
        cart.value.items.length > 0 &&
        hasDeliveryAddress.value &&
        paymentMethod.value
    )
})

function productImage(path: string) {
    return path
        ? `/api/product-image?path=${encodeURIComponent(path)}`
        : '/images/products/product-placeholder.jpg'
}

function formatMoney(value: number, currency: string) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency?.toUpperCase() || 'MXN'
    }).format(value)
}

function onPostalCodeInput(event: Event) {
    const input = event.target as HTMLInputElement
    const postalCode = input.value.replace(/\D/g, '').slice(0, 5)

    deliveryAddress.postalCode = postalCode
    postalCodeError.value = ''

    deliveryAddress.state = ''
    deliveryAddress.city = ''
    deliveryAddress.neighborhood = ''
    neighborhoodOptions.value = []

    // Preserve the existing temporary shipping behavior while the
    // real shipping quote by postal code is still pending.
    calculateDummyShipping()
}

async function searchPostalCode(
    options: {
        preserveNeighborhood?: boolean
    } = {}
) {
    const postalCode = deliveryAddress.postalCode.trim()

    if (!/^\d{5}$/.test(postalCode)) {
        postalCodeError.value =
            'El código postal debe contener 5 dígitos.'

        return
    }

    postalCodeLoading.value = true
    postalCodeError.value = ''

    const previousNeighborhood =
        deliveryAddress.neighborhood

    try {
        const postal = await $fetch<PostalCodeResponse>(
            `/api/postal-code/${encodeURIComponent(postalCode)}`
        )

        deliveryAddress.state =
            postal.state?.name ?? ''

        deliveryAddress.city =
            postal.locality?.name ??
            postal.municipality?.name ??
            ''

        neighborhoodOptions.value =
            postal.neighborhoods ?? []

        const savedNeighborhoodExists =
            neighborhoodOptions.value.some(
                item => item.name === previousNeighborhood
            )

        deliveryAddress.neighborhood =
            options.preserveNeighborhood &&
                savedNeighborhoodExists
                ? previousNeighborhood
                : ''

        if (
            !deliveryAddress.state ||
            !deliveryAddress.city ||
            neighborhoodOptions.value.length === 0
        ) {
            postalCodeError.value =
                'El código postal no tiene información completa.'
        }

        calculateDummyShipping()

        await nextTick()

        if (!deliveryAddress.neighborhood) {
            const neighborhoodSelect =
                document.getElementById(
                    'delivery-neighborhood'
                ) as HTMLSelectElement | null

            neighborhoodSelect?.focus()
        }
    } catch {
        deliveryAddress.state = ''
        deliveryAddress.city = ''
        deliveryAddress.neighborhood = ''
        neighborhoodOptions.value = []
        shippingCost.value = 0

        postalCodeError.value =
            'No se encontró información para este código postal.'
    } finally {
        postalCodeLoading.value = false
    }
}

watch(
    () => cart.value?.totals.subtotal,
    () => {
        calculateDummyShipping()
    },
    {
        immediate: true
    }
)

function calculateDummyShipping() {
    const subtotal = Number(
        cart.value?.totals.subtotal ?? 0
    )

    shippingCost.value =
        subtotal >= 2500
            ? 0
            : 130
}

async function changeQuantity(
    cartItemId: string,
    quantity: number
) {
    if (!Number.isFinite(quantity) || quantity < 1) {
        return
    }

    await updateItem(cartItemId, quantity)
}

const amountForFreeShipping = computed(() => {
    return Math.max(
        0,
        2500 - Number(cart.value?.totals.subtotal ?? 0)
    )
})

async function handleRemoveItem(cartItemId: string) {
    if (!cartItemId || removingItemId.value) {
        return
    }

    removingItemId.value = cartItemId
    cartActionError.value = ''

    try {
        await removeCartItem(cartItemId)
    } catch (error) {
        console.error('Unable to remove cart item:', error)

        cartActionError.value =
            'No fue posible eliminar el producto del carrito.'
    } finally {
        removingItemId.value = null
    }
}

function restoreDeliveryAddress() {
    const storedAddress = localStorage.getItem(
        DELIVERY_ADDRESS_STORAGE_KEY
    )

    if (!storedAddress) {
        return
    }

    try {
        const parsedAddress = JSON.parse(storedAddress)

        Object.assign(deliveryAddress, {
            name: String(parsedAddress.name ?? ''),
            email: String(parsedAddress.email ?? ''),
            phone: String(parsedAddress.phone ?? ''),
            street: String(parsedAddress.street ?? ''),
            exteriorNumber: String(
                parsedAddress.exteriorNumber ?? ''
            ),
            interiorNumber: String(
                parsedAddress.interiorNumber ?? ''
            ),
            neighborhood: String(
                parsedAddress.neighborhood ?? ''
            ),
            postalCode: String(parsedAddress.postalCode ?? ''),
            city: String(parsedAddress.city ?? ''),
            state: String(parsedAddress.state ?? ''),
            reference: String(parsedAddress.reference ?? '')
        })

        hasDeliveryAddress.value = Boolean(
            deliveryAddress.name &&
            deliveryAddress.email &&
            deliveryAddress.phone &&
            deliveryAddress.street &&
            deliveryAddress.exteriorNumber &&
            deliveryAddress.neighborhood &&
            deliveryAddress.postalCode &&
            deliveryAddress.city &&
            deliveryAddress.state
        )
    } catch {
        localStorage.removeItem(
            DELIVERY_ADDRESS_STORAGE_KEY
        )
    }
}

function restorePaymentMethod() {
    const storedPaymentMethod = localStorage.getItem(
        PAYMENT_METHOD_STORAGE_KEY
    )

    if (
        storedPaymentMethod === 'paypal' ||
        storedPaymentMethod === 'mercado_pago'
    ) {
        paymentMethod.value = storedPaymentMethod
    }
}

function continueCheckout() {
    checkoutError.value = ''

    if (!cart.value || cart.value.items.length === 0) {
        checkoutError.value =
            'Agrega al menos un producto al carrito.'
        return
    }

    if (!hasDeliveryAddress.value) {
        checkoutError.value =
            'Agrega una dirección de entrega.'
        return
    }

    if (!paymentMethod.value) {
        checkoutError.value =
            'Selecciona un método de pago.'
        return
    }

    console.log('Checkout ready:', {
        cart_id: cart.value.cart_id,
        address: { ...deliveryAddress },
        payment_method: paymentMethod.value,
        shipping_cost: shippingCost.value,
        total: grandTotal.value
    })

    // Tomorrow this will call the checkout/payment endpoint.
}

</script>