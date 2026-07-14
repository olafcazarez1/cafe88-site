import { erpFetch } from '../../utils/erp'

type PostalCodeResponse = {
    zip: string
    border_zone: boolean

    state: {
        state_id: string
        name: string
    } | null

    municipality: {
        state_id: string
        municipality_id: string
        name: string
    } | null

    locality: {
        locality_id: string
        name: string
    } | null

    neighborhoods: Array<{
        neighborhood_id: string
        zip: string
        name: string
    }>
}

export default defineEventHandler(async (event) => {
    const zip = getRouterParam(event, 'zip')

    if (!zip || !/^\d{5}$/.test(zip)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Código postal inválido.'
        })
    }

    return await erpFetch<PostalCodeResponse>(
        event,
        `/api/catalog/postal-code/${encodeURIComponent(zip)}`
    )
})