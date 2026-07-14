import { erpFetch } from '../../utils/erp'

export default defineEventHandler(async (event) => {
    await erpFetch<unknown>(
        event,
        '/api/shopping-cart',
        {
            method: 'DELETE'
        }
    )

    return null
})