<template>
    <main class="container py-5">
        <section class="checkout-payment-result mx-auto text-center">
            <div class="payment-result-icon is-error mb-3">
                <i class="bi bi-x-lg" aria-hidden="true" />
            </div>

            <span class="products-eyebrow">
                Pago no completado
            </span>

            <h1 class="h3 mt-2">
                No fue posible completar el pago
            </h1>

            <p class="text-muted">
                Mercado Pago canceló o rechazó la operación.
                Tu carrito permanece disponible y puedes intentarlo nuevamente.
            </p>

            <div v-if="paymentId || externalReference" class="payment-result-details mt-4 text-start">
                <div v-if="paymentId" class="summary-row">
                    <span>Referencia de pago</span>

                    <strong class="text-break">
                        {{ paymentId }}
                    </strong>
                </div>

                <div v-if="externalReference" class="summary-row">
                    <span>Referencia del carrito</span>

                    <strong class="text-break">
                        {{ externalReference }}
                    </strong>
                </div>

                <div class="summary-row">
                    <span>Estado</span>

                    <span class="badge text-bg-danger">
                        No completado
                    </span>
                </div>
            </div>

            <div class="d-grid gap-2 mt-4">
                <NuxtLink to="/checkout/review" class="btn btn-cafe88">
                    Intentar nuevamente
                </NuxtLink>

                <NuxtLink to="/cart" class="btn btn-outline-dark">
                    Volver al carrito
                </NuxtLink>

                <a :href="whatsappSupportUrl" class="btn btn-outline-success" target="_blank" rel="noopener noreferrer">
                    <i class="bi bi-whatsapp me-2" aria-hidden="true" />

                    Contactar por WhatsApp
                </a>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
const route = useRoute()

const paymentId = computed(() => {
    return String(
        route.query.payment_id ??
        route.query.collection_id ??
        ''
    ).trim()
})

const externalReference = computed(() => {
    return String(
        route.query.external_reference ??
        ''
    ).trim()
})

const whatsappSupportUrl = computed(() => {
    const reference =
        paymentId.value ||
        externalReference.value

    const message = reference
        ? `Hola Café88, tengo una duda sobre un pago no completado de Mercado Pago. Referencia: ${reference}.`
        : 'Hola Café88, tengo una duda sobre un pago no completado de Mercado Pago.'

    return `https://wa.me/522299063799?text=${encodeURIComponent(message)}`
})

useHead({
    title: 'Pago no completado | Cafe88'
})
</script>