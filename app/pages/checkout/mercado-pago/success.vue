<template>
    <main class="container py-5">
        <section class="checkout-payment-result mx-auto">

            <div v-if="processing" class="text-center py-5">
                <div class="spinner-border text-success" role="status" aria-label="Procesando pago" />

                <h1 class="h4 mt-4 mb-2">
                    Confirmando tu pedido
                </h1>

                <p class="text-muted mb-0">
                    Estamos verificando el pago y registrando tu compra.
                    No cierres esta ventana.
                </p>
            </div>

            <div v-else-if="errorMessage" class="text-center py-4">
                <div class="payment-result-icon is-error mb-3">
                    <i class="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                </div>

                <h1 class="h3">
                    No fue posible registrar el pedido
                </h1>

                <p class="text-muted">
                    {{ errorMessage }}
                </p>

                <p v-if="paymentId" class="small text-muted">
                    Referencia de Mercado Pago:
                    <strong>{{ paymentId }}</strong>
                </p>

                <button type="button" class="btn btn-cafe88 mt-3" :disabled="processing" @click="completeCheckout">
                    Intentar nuevamente
                </button>

                <NuxtLink to="/" class="btn btn-outline-secondary mt-3 ms-2">
                    Volver al inicio
                </NuxtLink>
            </div>

        </section>
    </main>
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
    shipping_cost: number
    payment_method: string
}

type MercadoPagoCheckoutResponse = {
    payment: {
        mercado_pago_payment_id: string
        status: string
        status_detail: string
        transaction_id: string
        transaction_status: string
        amount: string
        currency: string
        payer_email: string | null
        payer_name: string
        payment_method: string
        payment_type: string
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

const route = useRoute()

const {
    resetCartState
} = useCart()

const processing = ref(true)
const errorMessage = ref<string | null>(null)

const paymentId = computed(() => {
    return String(
        route.query.payment_id ??
        route.query.collection_id ??
        ''
    ).trim()
})

onMounted(async () => {
    await completeCheckout()
})

async function completeCheckout() {
    if (processing.value === false) {
        processing.value = true
    }

    errorMessage.value = null

    try {
        if (!paymentId.value) {
            throw new Error(
                'Mercado Pago no devolvió el identificador del pago.'
            )
        }

        const storedSummary = localStorage.getItem(
            'cafe88_checkout_summary'
        )

        if (!storedSummary) {
            throw new Error(
                'No encontramos la información de entrega de esta compra.'
            )
        }

        let checkoutSummary: CheckoutSummary

        try {
            checkoutSummary = JSON.parse(
                storedSummary
            ) as CheckoutSummary
        } catch {
            localStorage.removeItem(
                'cafe88_checkout_summary'
            )

            throw new Error(
                'La información guardada de la compra no es válida.'
            )
        }

        if (!checkoutSummary.address) {
            throw new Error(
                'La dirección de entrega no está disponible.'
            )
        }

        const completedCheckout =
            await $fetch<MercadoPagoCheckoutResponse>(
                '/api/mercado-pago/checkout',
                {
                    method: 'POST',

                    body: {
                        payment_id:
                            paymentId.value,

                        delivery_address:
                            checkoutSummary.address
                    }
                }
            )

        localStorage.setItem(
            'cafe88_completed_checkout',
            JSON.stringify(completedCheckout)
        )

        /*
         * Keep compatibility only if the existing final success page
         * still reads the old payment key.
         */
        localStorage.setItem(
            'cafe88_completed_payment',
            JSON.stringify({
                provider: 'mercado_pago',

                transaction_id:
                    completedCheckout.payment.transaction_id,

                amount:
                    completedCheckout.payment.amount,

                currency:
                    completedCheckout.payment.currency,

                payer_email:
                    completedCheckout.payment.payer_email
            })
        )

        localStorage.removeItem(
            'cafe88_checkout_summary'
        )

        resetCartState()

        await navigateTo(
            '/checkout/success',
            {
                replace: true
            }
        )
    } catch (error: any) {
        console.error(
            'Mercado Pago checkout failed:',
            error
        )

        errorMessage.value =
            error?.data?.statusMessage ??
            error?.data?.message ??
            error?.statusMessage ??
            error?.message ??
            'El pago fue recibido, pero no fue posible registrar el pedido.'
    } finally {
        processing.value = false
    }
}

useHead({
    title: 'Confirmando pedido | Cafe88'
})
</script>