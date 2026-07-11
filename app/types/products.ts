export type ProductCategory = {
    category_id: string
    code: string
    name: string
}

export type ProductSubcategory = {
    subcategory_id: string
    code: string
    name: string
}

export type CatalogProduct = {
    product_id: string
    brand_id: string
    model_id: string
    category_id: string
    subcategory_id: string
    code: string
    name: string
    short_name: string
    description: string
    image: string
    image_url: string
    currency: string
    status: string
    category: ProductCategory | null
    subcategory: ProductSubcategory | null
}