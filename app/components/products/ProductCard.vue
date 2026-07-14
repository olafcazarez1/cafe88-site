<template>
  <NuxtLink :to="`/products/${product.product_id}`" class="product-card-link">
    <article class="card product-catalog-card h-100">

      <div class="product-catalog-image-wrapper">
        <img :src="product.image_url" :alt="product.short_name" class="product-catalog-image" loading="lazy">
      </div>

      <div class="card-body d-flex flex-column">

        <div class="mb-2">
          <span class="product-category">
            {{ product.category?.name || 'Producto' }}
          </span>
        </div>

        <h2 class="product-catalog-title">
          {{ product.short_name }}
        </h2>

        <p class="product-catalog-code">
          {{ product.code }}
        </p>

        <p class="product-catalog-description">
          {{ shortDescription }}
        </p>

        <div class="mt-auto">

          <template v-if="hasPrice">
            <div class="product-price">
              {{ formattedPrice }}
            </div>

            <small class="text-muted">
              {{ defaultStock?.name || 'Unidad' }}
            </small>
          </template>

          <span v-else class="text-muted">
            Precio no disponible
          </span>

          <div v-if="hasPrice && !isAvailable" class="product-stock-status text-danger mt-2">
            Agotado
          </div>

        </div>

      </div>

    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
type ProductStock = {
  measure_id: string
  name: string
  default: number
  quantity: number
  discount: number
  price: number
  status: string
}

type Product = {
  product_id: string
  code: string
  short_name: string
  description: string
  image_url: string
  currency: string
  category?: {
    name: string
  } | null
  stock: ProductStock[]
}

const props = defineProps<{
  product: Product
}>()

const shortDescription = computed(() => {
  const description = props.product.description
    ?.replace(/\s+/g, ' ')
    .trim()

  if (!description) {
    return 'Conoce más acerca de este producto.'
  }

  return description.length > 140
    ? `${description.slice(0, 140).trim()}…`
    : description
})

const defaultStock = computed(() => {
  return (
    props.product.stock.find(item => item.default === 1) ||
    props.product.stock[0] ||
    null
  )
})

const hasPrice = computed(() => {
  return Number(defaultStock.value?.price ?? 0) > 0
})

const isAvailable = computed(() => {
  return Number(defaultStock.value?.quantity ?? 0) > 0
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: props.product.currency?.toUpperCase() || 'MXN'
  }).format(defaultStock.value?.price ?? 0)
})
</script>