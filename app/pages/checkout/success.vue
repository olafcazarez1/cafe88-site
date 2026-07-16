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

                <strong>
                    {{ paymentProvider }}
                </strong>
            </div>

            <div class="summary-row">
                <span>Transacción</span>

                <code>
            {{ checkout.payment.transaction_id }}
        </code>
            </div>

            <div v-if="checkout.payment.payer_email" class="summary-row">
                <span>
                    {{ paymentAccountLabel }}
                </span>

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

        <div class="success-support-notice">
            <div class="success-support-icon">
                <i class="bi bi-envelope-exclamation" aria-hidden="true" />
            </div>

            <div>
                <strong>
                    Revisa también tu carpeta de correo no deseado
                </strong>

                <p class="mb-2">
                    Enviamos la confirmación de tu pedido al correo registrado.
                    Si no la encuentras en tu bandeja de entrada, revisa las carpetas
                    de spam o promociones.
                </p>

                <p class="mb-0">
                    Para dudas o aclaraciones, escríbenos por WhatsApp al

                    <a :href="whatsappSupportUrl" target="_blank" rel="noopener noreferrer">
                        <strong>229 906 3799</strong>
                    </a>
                </p>
            </div>
        </div>

        <NuxtLink to="/products" class="btn btn-cafe88 mt-2">
            Seguir comprando
        </NuxtLink>
    </section>
</template>

<script setup lang="ts">
type CompletedCheckout = {
    payment: {
        provider: string

        provider_order_id: string
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

const whatsappSupportUrl = computed(() => {
    const orderCode =
        checkout.value?.sales_document.code ?? ''

    const message = orderCode
        ? `Hola Café88, tengo una duda sobre mi pedido ${orderCode}.`
        : 'Hola Café88, tengo una duda sobre mi pedido.'

    return `https://wa.me/522299063799?text=${encodeURIComponent(message)}`
})

const checkout = ref<CompletedCheckout | null>(null)

const paymentProvider = computed(() => {
    switch (checkout.value?.payment.provider) {
        case 'mercado_pago':
            return 'Mercado Pago'

        case 'paypal':
            return 'PayPal'

        default:
            return checkout.value?.payment.provider ?? 'Pago en línea'
    }
})

const paymentAccountLabel = computed(() => {
    return checkout.value?.payment.provider === 'mercado_pago'
        ? 'Cuenta Mercado Pago'
        : 'Cuenta PayPal'
})

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