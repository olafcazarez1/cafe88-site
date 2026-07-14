export type CartProduct = {
    product_id: string
    code: string
    name: string
    short_name: string
    description: string
    image: string
    currency: string
    status: string
}

export type CartMeasure = {
    measure_id: string
    code: string
    name: string
    status: string
}

export type CartTax = {
    cart_item_id: string
    tax_id: string
    code: string
    name: string
    percent: number
    tax_amount: number
}

export type CartItem = {
    cart_item_id: string
    cart_id: string
    product_id: string
    measure_id: string
    equivalence: number
    quantity: number
    currency: string
    original_price: number
    unit_price: number
    discount_amount: number
    product: CartProduct
    measure: CartMeasure
    taxes: CartTax[]
    original_line_total: number
    line_total: number
    tax_total: number
}

export type CartTotals = {
    original_subtotal: number
    subtotal: number
    discount: number
    tax: number
    total: number
}

export type ShoppingCart = {
    cart_id: string
    cart_token: string
    branch_id: string
    warehouse_id: string
    client_id: string
    user_id: string
    currency: string
    exchange_rate: number
    status: string
    expires_at: string
    created_at: string
    updated_at: string
    items: CartItem[]
    item_count: number
    total_quantity: number
    totals: CartTotals
}

export type AddCartItemPayload = {
    product_id: string
    measure_id: string
    quantity: number
}