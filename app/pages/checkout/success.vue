<template>
    <section class="checkout-success-card">
        <div class="success-hero">
            <img src="/images/cafe88-sticker.png" alt="Cafe88" class="success-sticker">

            <span class="products-eyebrow">
                Pago confirmado
            </span>

            <h1 class="fw-bold mt-2 mb-2">
                ¡Gracias por apoyar a Café88!
            </h1>

            <p class="text-muted mb-0">
                Tu pedido fue registrado correctamente y pronto comenzaremos a prepararlo.
            </p>
        </div>
        <div class="checkout-summary mt-2" v-if="checkout">
            <div class="order-badge">

                <div class="small text-uppercase text-muted">
                    Número de pedido
                </div>

                <div class="order-code">
                    {{ checkout.sales_document.code }}
                </div>

            </div>

            <div class="summary-row">
                <span>Estado del pago</span>

                <span class="badge rounded-pill" :class="checkout.sales_document.payment_status === 'paid'
                    ? 'bg-success'
                    : 'bg-warning text-dark'
                    ">
                    {{
                        checkout.sales_document.payment_status === 'paid'
                            ? 'Pagado'
                            : checkout.sales_document.payment_status
                    }}
                </span>
            </div>

            <div class="summary-row">
                <span>Total pagado</span>

                <strong>
                    {{
                        formatMoney(
                            checkout.sales_document.total,
                            checkout.sales_document.currency
                        )
                    }}
                </strong>
            </div>

            <hr>

            <div class="summary-row">
                <span>Método</span>
                <strong>PayPal</strong>
            </div>

            <div class="summary-row">
                <span>Transacción</span>

                <code>
            {{ checkout.payment.transaction_id }}
        </code>
            </div>

            <div v-if="checkout.payment.payer_email" class="summary-row">
                <span>Cuenta PayPal</span>

                <strong>
                    {{ checkout.payment.payer_email }}
                </strong>
            </div>
        </div>

        <p class="success-message">
            Gracias por elegir Café88.
            Enviaremos la confirmación y el seguimiento de tu pedido
            al correo electrónico registrado.
        </p>

        <NuxtLink to="/products" class="btn btn-cafe88 mt-2">
            Seguir comprando
        </NuxtLink>
    </section>
</template>

<script setup lang="ts">
type CompletedCheckout = {
    payment: {
        paypal_order_id: string
        transaction_id: string
        transaction_status: string
        amount: string
        currency: string
        payer_email: string | null
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

const checkout = ref<CompletedCheckout | null>(null)

onMounted(() => {
    const storedCheckout = localStorage.getItem(
        'cafe88_completed_checkout'
    )

    if (!storedCheckout) {
        return
    }

    try {
        checkout.value = JSON.parse(storedCheckout)
    } catch {
        localStorage.removeItem(
            'cafe88_completed_checkout'
        )
    }
})

function formatMoney(
    value: string | number | null,
    currency: string | null
) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency?.toUpperCase() || 'MXN'
    }).format(Number(value ?? 0))
}

useHead({
    title: 'Pedido confirmado | Cafe88'
})
</script>