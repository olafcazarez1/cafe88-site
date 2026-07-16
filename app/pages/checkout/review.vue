<template>
    <div>
        <!-- Checkout progress -->
        <nav class="checkout-progress mb-4" aria-label="Progreso de compra">
            <NuxtLink to="/cart" class="checkout-progress-step is-complete">
                <span class="checkout-progress-number">1</span>
                <span class="checkout-progress-label">Carrito</span>
            </NuxtLink>

            <span class="checkout-progress-line is-complete" />

            <NuxtLink to="/cart" class="checkout-progress-step is-complete">
                <span class="checkout-progress-number">2</span>
                <span class="checkout-progress-label">Dirección</span>
            </NuxtLink>

            <span class="checkout-progress-line is-complete" />

            <div class="checkout-progress-step is-current">
                <span class="checkout-progress-number">3</span>
                <span class="checkout-progress-label">Revisión</span>
            </div>

            <span class="checkout-progress-line" />

            <div class="checkout-progress-step">
                <span class="checkout-progress-number">4</span>
                <span class="checkout-progress-label">Pago</span>
            </div>
        </nav>

        <header class="mb-4">
            <span class="products-eyebrow">
                Último paso
            </span>

            <h1 class="fw-bold mt-2 mb-2">
                Revisa tu pedido
            </h1>

            <p class="text-muted mb-0">
                Verifica tus productos, dirección y método de pago.
            </p>
        </header>

        <div v-if="pending" class="products-state">
            Cargando pedido...
        </div>

        <div v-else-if="!cart || !checkoutSummary" class="products-state">
            <h2 class="h4">
                No hay información suficiente
            </h2>

            <p class="text-muted">
                Regresa al carrito para completar tu pedido.
            </p>

            <NuxtLink to="/cart" class="btn btn-cafe88">
                Volver al carrito
            </NuxtLink>
        </div>

        <div v-else class="row g-4">
            <div class="col-lg-8">

                <!-- Products -->
                <section class="checkout-review-card mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2 class="h4 fw-bold mb-0">
                            Productos
                        </h2>

                        <NuxtLink to="/cart" class="checkout-edit-link">
                            Editar
                        </NuxtLink>
                    </div>

                    <article v-for="item in cart.items" :key="item.cart_item_id" class="checkout-review-item">
                        <img :src="productImage(item.product.image)" :alt="item.product.short_name"
                            class="checkout-review-image">

                        <div class="flex-grow-1">
                            <h3 class="h6 fw-bold mb-1">
                                {{ item.product.short_name }}
                            </h3>

                            <p class="small text-muted mb-2">
                                {{ item.measure.name }}
                            </p>

                            <div class="checkout-review-pricing">
                                <span>
                                    {{ formatMoney(item.unit_price, item.currency) }}
                                    ×
                                    {{ item.quantity }}
                                </span>
                            </div>
                        </div>

                        <strong class="checkout-review-line-total">
                            {{ formatMoney(item.line_total, item.currency) }}
                        </strong>
                    </article>
                </section>

                <!-- Delivery address -->
                <section class="checkout-review-card mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h4 fw-bold mb-0">
                            Dirección de entrega
                        </h2>

                        <NuxtLink to="/cart" class="checkout-edit-link">
                            Editar
                        </NuxtLink>
                    </div>

                    <div class="checkout-address">
                        <div class="checkout-address-name">
                            <i class="bi bi-person-fill" aria-hidden="true" />
                            <strong>{{ checkoutSummary.address.name }}</strong>
                        </div>

                        <div class="checkout-address-row">
                            <i class="bi bi-geo-alt-fill" aria-hidden="true" />

                            <div>
                                <p class="mb-1">
                                    {{ checkoutSummary.address.street }}
                                    {{ checkoutSummary.address.exteriorNumber }}

                                    <template v-if="checkoutSummary.address.interiorNumber">
                                        Int. {{ checkoutSummary.address.interiorNumber }}
                                    </template>
                                </p>

                                <p class="mb-1">
                                    {{ checkoutSummary.address.neighborhood }}
                                </p>

                                <p class="mb-0">
                                    C.P. {{ checkoutSummary.address.postalCode }}
                                    ·
                                    {{ checkoutSummary.address.city }},
                                    {{ checkoutSummary.address.state }}
                                </p>
                            </div>
                        </div>

                        <div class="checkout-address-row">
                            <i class="bi bi-telephone-fill" aria-hidden="true" />
                            <span>{{ checkoutSummary.address.phone }}</span>
                        </div>

                        <div class="checkout-address-row">
                            <i class="bi bi-envelope-fill" aria-hidden="true" />
                            <span>{{ checkoutSummary.address.email }}</span>
                        </div>

                        <div v-if="checkoutSummary.address.reference" class="checkout-address-reference">
                            <strong>Referencias:</strong>
                            {{ checkoutSummary.address.reference }}
                        </div>
                    </div>
                </section>

                <!-- Payment -->
                <section class="checkout-review-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h4 fw-bold mb-0">
                            Método de pago
                        </h2>

                        <NuxtLink to="/cart" class="checkout-edit-link">
                            Editar
                        </NuxtLink>
                    </div>

                    <div class="checkout-payment-card">
                        <div class="checkout-payment-logo">
                            <span v-if="checkoutSummary.payment_method === 'paypal'">
                                PayPal
                            </span>

                            <span v-else>
                                Mercado Pago
                            </span>
                        </div>

                        <div>
                            <strong>{{ paymentMethodName }}</strong>

                            <p class="small text-muted mb-0">
                                Serás redirigido al proveedor de pago para completar
                                la transacción de forma segura.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Summary -->
            <div class="col-lg-4">
                <aside class="cart-summary-card checkout-summary-sticky">
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

                            <small class="d-block text-muted mt-1">
                                Envío estándar
                            </small>
                        </div>

                        <span v-if="checkoutSummary.shipping_cost > 0">
                            {{
                                formatMoney(
                                    checkoutSummary.shipping_cost,
                                    cart.currency
                                )
                            }}
                        </span>

                        <strong v-else class="text-success">
                            Gratis
                        </strong>
                    </div>

                    <hr>

                    <div class="cart-summary-row cart-summary-total">
                        <span>Total</span>

                        <span>
                            {{ formatMoney(checkoutSummary.total, cart.currency) }}
                        </span>
                    </div>

                    <div class="checkout-secure-box">
                        <i class="bi bi-lock-fill" aria-hidden="true" />

                        <div>
                            <strong>Pago seguro</strong>
                            <small class="d-block text-muted">
                                Tus datos viajan cifrados mediante SSL.
                            </small>
                        </div>
                    </div>

                    <CheckoutPayPalButton v-if="checkoutSummary?.payment_method === 'paypal'"
                        :shipping-cost="checkoutSummary.shipping_cost" :delivery-address="checkoutSummary.address"
                        @completed="handlePayPalCompleted" />

                    <button v-else-if="
                        checkoutSummary?.payment_method === 'mercado_pago'
                    " type="button" class="btn btn-cafe88 btn-lg w-100 mt-4" :disabled="mercadoPagoPending"
                        @click="startMercadoPagoCheckout">
                        <span v-if="mercadoPagoPending" class="spinner-border spinner-border-sm me-2" />

                        {{
                            mercadoPagoPending
                                ? 'Abriendo Mercado Pago...'
                        : 'Pagar con Mercado Pago'
                        }}
                    </button>

                    <div v-if="mercadoPagoError" class="alert alert-danger mt-3">
                        {{ mercadoPagoError }}
                    </div>
                </aside>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
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

type CheckoutSummary = {
    address: DeliveryAddress
    payment_method: 'paypal' | 'mercado_pago'
    shipping_cost: number
    total: number
}

type PayPalCompletedPayment = {
    paypal_order_id: string
    status: string
    transaction_id: string | null
    transaction_status: string | null
    amount: string | null
    currency: string | null
    payer_email: string | null
    payer_name: string
}

type MercadoPagoPreferenceResponse = {
    preference_id: string
    init_point: string
    sandbox_init_point: string
}

const mercadoPagoPending = ref(false)
const mercadoPagoError = ref<string | null>(null)

type CompletedCheckout = {
    payment: {
        paypal_order_id: string
        status: string
        transaction_id: string
        transaction_status: string
        amount: string
        currency: string
        payer_email: string | null
        payer_name: string
    }

    sales_document: {
        document_id: string
        code: string
        payment_id: string
        payment_code: string
        payment_status: string
        total: number
        currency: string
        already_processed: boolean
    }
}

const {
    cart,
    pending,
    loadCart,
    resetCartState
} = useCart()

const checkoutSummary = ref<CheckoutSummary | null>(null)

await loadCart()

onMounted(() => {
    const storedSummary = localStorage.getItem(
        'cafe88_checkout_summary'
    )

    if (!storedSummary) {
        return
    }

    try {
        checkoutSummary.value =
            JSON.parse(storedSummary)
    } catch {
        localStorage.removeItem(
            'cafe88_checkout_summary'
        )
    }
})

const paymentMethodName = computed(() => {
    if (
        checkoutSummary.value?.payment_method ===
        'mercado_pago'
    ) {
        return 'Tarjeta de crédito o débito — Mercado Pago'
    }

    if (
        checkoutSummary.value?.payment_method ===
        'paypal'
    ) {
        return 'PayPal'
    }

    return 'No seleccionado'
})

function productImage(path: string) {
    return path
        ? `/api/product-image?path=${encodeURIComponent(path)}`
        : '/images/products/product-placeholder.jpg'
}

function formatMoney(
    value: number,
    currency: string
) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency?.toUpperCase() || 'MXN'
    }).format(value)
}

async function handlePayPalCompleted(
    result: CompletedCheckout
) {
    console.log(
        'Checkout completed:',
        result
    )

    localStorage.setItem(
        'cafe88_completed_checkout',
        JSON.stringify(result)
    )

    localStorage.removeItem(
        'cafe88_checkout_summary'
    )

    localStorage.removeItem(
        'cafe88_delivery_address'
    )

    localStorage.removeItem(
        'cafe88_payment_method'
    )

    resetCartState()

    await navigateTo('/checkout/success')
}

async function startMercadoPagoCheckout() {
    if (
        mercadoPagoPending.value ||
        !cart.value
    ) {
        return
    }

    mercadoPagoPending.value = true
    mercadoPagoError.value = null

    try {
        localStorage.setItem(
            'cafe88_checkout_summary',
            JSON.stringify(checkoutSummary.value)
        )

        const response =
            await $fetch<MercadoPagoPreferenceResponse>(
                '/api/mercado-pago/preference',
                {
                    method: 'POST',

                    body: {
                        cart_id: cart.value.cart_id,

                        shipping:
                            checkoutSummary.value.shipping_cost,

                        payer: {
                            name:
                                checkoutSummary.value.address.name,

                            email:
                                checkoutSummary.value.address.email
                        },

                        items: cart.value.items.map(item => ({
                            product_id: item.product_id,
                            name:
                                item.product.short_name,
                            quantity: item.quantity,
                            price: item.unit_price
                        }))
                    }
                }
            )

        window.location.href =
            import.meta.dev
                ? response.sandbox_init_point
                : response.init_point

    } catch (error) {

        console.error(error)

        mercadoPagoError.value =
            'No fue posible iniciar Mercado Pago.'

    } finally {

        mercadoPagoPending.value = false

    }
}

useHead({
    title: 'Revisar pedido | Cafe88'
})
</script>
