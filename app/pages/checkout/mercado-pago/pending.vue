<template>
    <main class="container py-5">
        <section class="checkout-payment-result mx-auto text-center">
            <div class="payment-result-icon is-pending mb-3">
                <i class="bi bi-clock-fill" aria-hidden="true" />
            </div>

            <span class="products-eyebrow">
                Pago pendiente
            </span>

            <h1 class="h3 mt-2">
                Mercado Pago está procesando tu pago
            </h1>

            <p class="text-muted">
                Algunos métodos de pago pueden tardar unos minutos o más
                en confirmarse. No intentes pagar nuevamente mientras la
                operación siga pendiente.
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

                    <span class="badge text-bg-warning">
                        Pendiente
                    </span>
                </div>
            </div>

            <p class="small text-muted mt-4">
                Cuando Mercado Pago confirme la operación, podremos registrar
                el pedido. Conserva la referencia para cualquier aclaración.
            </p>

            <div class="d-grid gap-2 mt-4">
                <NuxtLink to="/" class="btn btn-cafe88">
                    Volver al inicio
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
        ? `Hola Café88, tengo una duda sobre un pago pendiente de Mercado Pago. Referencia: ${reference}.`
        : 'Hola Café88, tengo una duda sobre un pago pendiente de Mercado Pago.'

    return `https://wa.me/522299063799?text=${encodeURIComponent(message)}`
})

useHead({
    title: 'Pago pendiente | Cafe88'
})
</script>