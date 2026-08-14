import {
    validateMercadoPagoWebhookSignature
} from '../../utils/mercado-pago'

import {
    processMercadoPagoCheckout
} from '../../utils/process-mercado-pago-checkout'

type MercadoPagoWebhookBody = {
    id?: string | number
    action?: string
    api_version?: string
    date_created?: string
    live_mode?: boolean
    type?: string
    user_id?: string | number

    data?: {
        id?: string | number
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const body =
        await readBody<MercadoPagoWebhookBody>(
            event
        )

    const notificationType = String(
        query.type ??
        body?.type ??
        ''
    ).trim()

    /*
     * Only payment notifications belong to this processor.
     * Other configured topics are acknowledged and ignored.
     */
    if (notificationType !== 'payment') {
        return {
            received: true,
            ignored: true,
            reason:
                'Unsupported notification type'
        }
    }

    const queryDataId = String(
        query['data.id'] ?? ''
    ).trim()

    const bodyDataId = String(
        body?.data?.id ?? ''
    ).trim()

    const paymentId =
        queryDataId ||
        bodyDataId

    if (!paymentId) {
        throw createError({
            statusCode: 400,
            statusMessage:
                'Mercado Pago payment ID is required.'
        })
    }

    validateMercadoPagoWebhookSignature(
        event,
        queryDataId || paymentId
    )

    /*
     * Acknowledge non-approved states without creating an ERP
     * order. Mercado Pago may notify more than once as status
     * changes.
     */
    try {
        const completed =
            await processMercadoPagoCheckout({
                event,
                paymentId
            })

        return {
            received: true,
            processed: true,

            document_id:
                completed.sales_document.document_id,

            already_processed:
                completed.sales_document.already_processed
        }
    } catch (error: any) {
        const statusCode =
            Number(
                error?.statusCode ??
                error?.response?.status ??
                500
            )

        /*
         * Pending/rejected/cancelled payments are valid events.
         * Return 200 so Mercado Pago does not keep retrying them.
         */
        if (statusCode === 409) {
            return {
                received: true,
                processed: false,

                payment_id:
                    paymentId,

                reason:
                    error?.statusMessage ??
                    'Payment is not approved'
            }
        }

        /*
         * Throw on temporary/internal errors so Mercado Pago may
         * retry the notification.
         */
        console.error(
            '[Mercado Pago] Webhook processing failed:',
            error
        )

        throw error
    }
})