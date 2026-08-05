<template>
    <div>
        <div v-if="loading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status" />

            <span class="ms-2">
                Cargando PayPal...
            </span>
        </div>

        <div ref="paypalContainer" :class="{ 'd-none': loading }" />

        <div v-if="errorMessage" class="alert alert-danger py-2 mt-3 mb-0">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
type PayPalNamespace = {
    Buttons: (
        options: Record<string, unknown>
    ) => {
        render: (
            target: HTMLElement
        ) => Promise<void>

        isEligible: () => boolean
    }
}

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

declare global {
    interface Window {
        paypal?: PayPalNamespace
    }
}

const props = defineProps<{
    shippingCost: number
    deliveryAddress: DeliveryAddress
}>()

const emit = defineEmits<{
    completed: [capture: unknown]
}>()

const config = useRuntimeConfig()

const paypalContainer =
    ref<HTMLElement | null>(null)

const loading = ref(true)
const errorMessage = ref('')

function loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve()
            return
        }

        const existingScript =
            document.querySelector<HTMLScriptElement>(
                'script[data-cafe88-paypal-sdk]'
            )

        if (existingScript) {
            existingScript.addEventListener(
                'load',
                () => resolve(),
                {
                    once: true
                }
            )

            existingScript.addEventListener(
                'error',
                () => reject(
                    new Error('Unable to load PayPal SDK')
                ),
                {
                    once: true
                }
            )

            return
        }

        const clientId =
            String(config.public.paypalClientId || '')

        if (!clientId) {
            reject(
                new Error(
                    'PayPal Client ID is not configured'
                )
            )

            return
        }

        const script =
            document.createElement('script')

        script.dataset.cafe88PaypalSdk = 'true'

        script.src =
            'https://www.paypal.com/sdk/js' +
            `?client-id=${encodeURIComponent(clientId)}` +
            '&currency=MXN' +
            '&intent=capture' +
            '&components=buttons' +
            '&disable-funding=card'

        script.async = true

        script.onload = () => resolve()

        script.onerror = () => {
            reject(
                new Error('Unable to load PayPal SDK')
            )
        }

        document.head.appendChild(script)
    })
}

async function renderPayPalButton() {
    if (
        !window.paypal ||
        !paypalContainer.value
    ) {
        return
    }

    const buttons = window.paypal.Buttons({
        style: {
            layout: 'vertical',
            shape: 'rect',
            label: 'paypal',
            height: 45
        },

        createOrder: async () => {
            const order = await $fetch<{
                id: string
                status: string
            }>(
                '/api/paypal/orders',
                {
                    method: 'POST',

                    body: {
                        delivery_address: props.deliveryAddress,
                    }
                }
            )

            return order.id
        },

        onApprove: async (data: {
            orderID: string
        }) => {
            errorMessage.value = ''

            try {
                const capture = await $fetch(
                    `/api/paypal/orders/${encodeURIComponent(data.orderID)
                    }/capture`,
                    {
                        method: 'POST',

                        body: {
                            delivery_address: props.deliveryAddress
                        }
                    }
                )

                emit('completed', capture)
            } catch (error) {
                console.error(
                    'Unable to capture PayPal payment:',
                    error
                )

                errorMessage.value =
                    'El pago fue autorizado, pero no pudimos confirmarlo. No intentes pagar nuevamente hasta verificar la operación.'
            }
        },

        onCancel: () => {
            errorMessage.value =
                'El pago fue cancelado.'
        },

        onError: (error: unknown) => {
            console.error(
                'PayPal checkout error:',
                error
            )

            errorMessage.value =
                'No fue posible iniciar el pago con PayPal.'
        }
    })

    if (!buttons.isEligible()) {
        errorMessage.value =
            'PayPal no está disponible en este dispositivo.'

        return
    }

    await buttons.render(
        paypalContainer.value
    )
}

onMounted(async () => {
    try {
        await loadPayPalScript()
        await renderPayPalButton()
    } catch (error) {
        console.error(
            'Unable to initialize PayPal:',
            error
        )

        errorMessage.value =
            'No fue posible cargar PayPal.'
    } finally {
        loading.value = false
    }
})
</script>