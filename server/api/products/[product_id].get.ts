type ProductCategory = {
    category_id: string
    code: string
    name: string
    type: string
    status: string
}

type ProductSubcategory = {
    category_id: string
    subcategory_id: string
    code: string
    name: string
    status: string
}

type ProductTax = {
    tax_id: string
    product_id: string
    code: string
    name: string
    percent: number
    status: string
}

type ProductStock = {
    product_id: string
    warehouse_id: string
    measure_id: string
    code: string
    name: string
    external_reference?: string
    equivalence: number
    default: number
    weight?: number
    quantity: number
    discount: number
    price: number
    status: string
}

type ErpProduct = {
    product_id: string
    brand_id: string
    model_id: string
    category_id: string
    subcategory_id: string
    external_reference: string
    code: string
    name: string
    short_name: string
    description: string
    image: string
    currency: string
    type: string
    is_imported: number
    has_units: number
    status: string
    category: ProductCategory | null
    subcategory: ProductSubcategory | null
    taxes?: ProductTax[]
    stock?: ProductStock[]
}

type ErpProductResponse =
    | ErpProduct
    | {
        result?: ErpProduct
    }

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const productId = getRouterParam(event, 'product_id')

    if (!productId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El identificador del producto es requerido.'
        })
    }

    if (!config.erpBaseUrl) {
        throw createError({
            statusCode: 500,
            statusMessage: 'ERP base URL is not configured.'
        })
    }

    if (!config.erpApiToken) {
        throw createError({
            statusCode: 500,
            statusMessage: 'ERP API token is not configured.'
        })
    }

    if (!config.erpWarehouseId) {
        throw createError({
            statusCode: 500,
            statusMessage: 'ERP warehouse ID is not configured.'
        })
    }

    try {
        const response = await $fetch<ErpProductResponse | undefined>(
            `/api/warehouse/${config.erpWarehouseId}/product/${productId}`,
            {
                baseURL: config.erpBaseUrl,

                headers: {
                    Authorization: String(config.erpApiToken)
                }
            }
        )

        const erpPath =
            `/api/warehouse/${config.erpWarehouseId}/product/${productId}`

        console.log('Loading ERP product:', {
            baseURL: config.erpBaseUrl,
            path: erpPath,
            productId
        })

        if (!response) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Producto no encontrado.'
            })
        }

        const product =
            'result' in response
                ? response.result
                : response

        if (!product) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Producto no encontrado.'
            })
        }

        const baseUrl = String(config.erpBaseUrl).replace(/\/$/, '')

        return {
            ...product,

            image_url: product.image
                ? `${baseUrl}/${product.image.replace(/^\/+/, '')}`
                : '/images/products/product-placeholder.jpg',

            taxes: product.taxes ?? [],
            stock: (product.stock ?? []).map(stockItem => ({
                ...stockItem,
                quantity: 99
            }))
        }
    } catch (error: unknown) {
        const fetchError = error as {
            response?: {
                status?: number
                _data?: unknown
            }
            statusCode?: number
            statusMessage?: string
            message?: string
        }

        if (
            fetchError.response?.status === 404 ||
            fetchError.statusCode === 404
        ) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Producto no encontrado.'
            })
        }

        console.error(
            'Unable to load ERP product:',
            fetchError.response?.status,
            fetchError.response?._data ?? fetchError.message
        )

        throw createError({
            statusCode:
                fetchError.response?.status ||
                fetchError.statusCode ||
                502,

            statusMessage: 'No fue posible consultar el producto.'
        })
    }
})