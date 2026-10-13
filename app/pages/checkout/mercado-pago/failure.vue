<template>
    <main class="container py-5">
        <section class="checkout-payment-result payment-failure mx-auto">
            <div class="payment-failure-header text-center">
                <div class="payment-result-icon is-error mb-3">
                    <i class="bi bi-x-lg" aria-hidden="true" />
                </div>

                <div class="products-eyebrow mb-2">Pago no completado</div>

                <h1 class="h3 mb-3">No fue posible completar el pago</h1>

                <p class="text-muted mb-0">
                    La operación no se completó en Mercado Pago.
                    Si no se realizó ningún cargo, puedes intentarlo nuevamente.
                    Si observas un cargo, contáctanos antes de volver a pagar.
                </p>
            </div>

            <div v-if="paymentId || externalReference" class="payment-result-details payment-failure-details mt-4">
                <div v-if="paymentId" class="payment-failure-row">
                    <span>Referencia de pago</span>
                    <strong>{{ paymentId }}</strong>
                </div>

                <div v-if="externalReference" class="payment-failure-row">
                    <span>Referencia del carrito</span>
                    <strong>{{ externalReference }}</strong>
                </div>

                <div class="payment-failure-row">
                    <span>Estado</span>
                    <span class="badge text-bg-danger">No completado</span>
                </div>
            </div>

            <div class="payment-failure-actions mt-4">
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

function cleanQueryValue(value: unknown): string {
    const candidate = Array.isArray(value) ? value[0] : value
    if (typeof candidate !== 'string') return ''
    const cleaned = candidate.trim()
    return ['null', 'undefined', ''].includes(cleaned.toLowerCase()) ? '' : cleaned
}

const paymentId = computed(() =>
    cleanQueryValue(route.query.payment_id) ||
    cleanQueryValue(route.query.collection_id)
)

const externalReference = computed(() =>
    cleanQueryValue(route.query.external_reference)
)

const whatsappSupportUrl = computed(() => {
    const reference = paymentId.value || externalReference.value
    const message = reference
        ? `Hola Café88, tengo una duda sobre un pago no completado de Mercado Pago. Referencia: ${reference}.`
        : 'Hola Café88, tengo una duda sobre un pago no completado de Mercado Pago.'

    return `https://wa.me/522299063799?text=${encodeURIComponent(message)}`
})

useHead({ title: 'Pago no completado | Café88' })
</script>