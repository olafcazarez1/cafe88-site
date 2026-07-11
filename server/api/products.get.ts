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
  created_at?: string
  updated_at?: string
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
  created_at?: string
  updated_at?: string
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
  created_at?: string
  updated_at?: string
  category: ProductCategory | null
  subcategory: ProductSubcategory | null
  taxes?: ProductTax[]
  stock?: ProductStock[]
}

type WarehouseProduct = ErpProduct & {
  image_url: string
  taxes: ProductTax[]
  stock: ProductStock[]
}

type ProductsResponse = {
  results: WarehouseProduct[]
  total_rows: number
}

type ErpProductsResponse =
  | ErpProduct[]
  | {
    results?: ErpProduct[]
    total_rows?: number
  }

export default defineEventHandler(async (): Promise<ProductsResponse> => {
  const config = useRuntimeConfig()

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
    const response = await $fetch<ErpProductsResponse | undefined>(
      `/api/warehouse/${config.erpWarehouseId}/products`,
      {
        baseURL: config.erpBaseUrl,

        headers: {
          Authorization: `Bearer ${config.erpApiToken}`
        }
      }
    )

    if (!response) {
      return {
        results: [],
        total_rows: 0
      }
    }

    const rawProducts = Array.isArray(response)
      ? response
      : response.results ?? []

    const products: WarehouseProduct[] = rawProducts
      .filter(product => product.status === 'active')
      .map(product => ({
        ...product,

        image_url: product.image
          ? `/api/product-image?path=${encodeURIComponent(product.image)}`
          : '/images/products/product-placeholder.jpg',

        taxes: product.taxes ?? [],
        stock: product.stock ?? []
      }))

    return {
      results: products,
      total_rows: products.length
    }
  } catch (error: unknown) {
    const fetchError = error as {
      response?: {
        status?: number
        _data?: unknown
      }
      statusCode?: number
      message?: string
    }

    /*
     * Defensive support in case the HTTP client reports 204
     * as an error in a future version.
     */
    if (fetchError.response?.status === 204) {
      return {
        results: [],
        total_rows: 0
      }
    }

    console.error(
      'Unable to load ERP products:',
      fetchError.response?.status,
      fetchError.response?._data ?? fetchError.message
    )

    throw createError({
      statusCode:
        fetchError.response?.status ||
        fetchError.statusCode ||
        502,

      statusMessage: 'No fue posible consultar los productos.'
    })
  }
})