import { erpFetch } from '../../utils/erp'

export default defineEventHandler(async (event) => {
    try {
        return await erpFetch<Record<string, unknown>>(
            event,
            '/api/shopping-cart'
        )
    } catch (error: unknown) {
        const cartError = error as {
            statusCode?: number
        }

        /*
         * The cart does not exist yet.
         * Return null so the frontend can create it when required.
         */
        if (cartError.statusCode === 404) {
            return null
        }

        throw error
    }
})