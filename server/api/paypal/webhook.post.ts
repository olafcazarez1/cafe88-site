import {
    validatePayPalWebhook,
    type PayPalWebhookEvent
} from '../../utils/paypal'

import {
    processPayPalCheckout
} from '../../utils/process-paypal-checkout'

export default defineEventHandler(async (event) => {
    const body =
        await readBody<PayPalWebhookEvent>(event)

    await validatePayPalWebhook(
        event,
        body
    )

    /*
     * Ignore events we don't care about.
     */
    const supportedEvents = [
        'CHECKOUT.PAYMENT-RESOURCE.PAYMENT-COMPLETED',

        // Backward compatibility
        'PAYMENT.CAPTURE.COMPLETED'
    ]

    if (
        !supportedEvents.includes(body.event_type)
    ) {
        return {
            received: true,
            ignored: true
        }
    }

    const captureId = String(
        body.resource?.id ?? ''
    ).trim()

    if (!captureId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'PayPal capture id is required.'
        })
    }

    try {
        const completed =
            await processPayPalCheckout({
                event,
                captureId
            })

        return {
            received: true,
            processed: true,

            document_id:
                completed.sales_document.document_id,

            already_processed:
                completed.sales_document
                    .already_processed
        }
    } catch (error: any) {
        const statusCode =
            Number(
                error?.statusCode ??
                error?.response?.status ??
                500
            )

        /*
         * PayPal can notify before the payment is
         * actually completed.
         */
        if (statusCode === 409) {
            return {
                received: true,
                processed: false,

                reason:
                    error?.statusMessage
            }
        }

        console.error(
            '[PayPal] Webhook processing failed:',
            error
        )

        throw error
    }
})