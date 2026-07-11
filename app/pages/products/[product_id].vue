<template>
  <div>

    <div
      v-if="pending"
      class="product-detail-state"
    >
      <div
        class="spinner-border"
        role="status"
        aria-label="Cargando producto"
      />

      <p class="mt-3 mb-0">
        Cargando producto...
      </p>
    </div>

    <div
      v-else-if="error"
      class="product-detail-state"
    >
      <h1 class="h3">
        Producto no disponible
      </h1>

      <p class="text-muted">
        No fue posible consultar este producto.
      </p>

      <NuxtLink
        to="/products"
        class="btn btn-cafe88"
      >
        Volver a productos
      </NuxtLink>
    </div>

    <template v-else-if="product">

      <nav
        aria-label="breadcrumb"
        class="mb-4"
      >
        <ol class="breadcrumb">

          <li class="breadcrumb-item">
            <NuxtLink to="/">
              Inicio
            </NuxtLink>
          </li>

          <li class="breadcrumb-item">
            <NuxtLink to="/products">
              Productos
            </NuxtLink>
          </li>

          <li
            class="breadcrumb-item active"
            aria-current="page"
          >
            {{ product.short_name }}
          </li>

        </ol>
      </nav>

      <section class="product-detail-card">

        <div class="row g-5 align-items-start">

          <div class="col-lg-6">

            <div class="product-detail-image-wrapper">
              <img
                :src="product.image_url"
                :alt="product.short_name"
                class="product-detail-image"
              >
            </div>

          </div>

          <div class="col-lg-6">

            <div class="mb-3">

              <span class="product-category">
                {{ product.category?.name || 'Producto' }}
              </span>

              <span
                v-if="product.subcategory?.name"
                class="text-muted ms-2"
              >
                · {{ product.subcategory.name }}
              </span>

            </div>

            <h1 class="product-detail-title">
              {{ product.short_name }}
            </h1>

            <p class="product-detail-code">
              Código: {{ product.code }}
            </p>

            <div class="product-detail-description">
              {{ product.description }}
            </div>

            <hr class="my-4">

            <div
              v-if="availableMeasures.length"
              class="mb-4"
            >
              <label
                for="measure"
                class="form-label fw-semibold"
              >
                Presentación
              </label>

              <select
                id="measure"
                v-model="selectedMeasureId"
                class="form-select form-select-lg"
              >
                <option
                  v-for="stockItem in availableMeasures"
                  :key="stockItem.measure_id"
                  :value="stockItem.measure_id"
                >
                  {{ stockItem.name }}
                </option>
              </select>
            </div>

            <div class="purchase-panel">

              <template v-if="selectedStock">

                <div
                  v-if="hasPrice"
                  class="product-detail-price"
                >
                  {{ formattedPrice }}
                </div>

                <p
                  v-else
                  class="text-muted mb-3"
                >
                  Precio no disponible
                </p>

                <p
                  v-if="hasDiscount"
                  class="product-discount"
                >
                  Descuento: {{ selectedStock.discount }}%
                </p>

                <p
                  v-if="isAvailable"
                  class="product-availability text-success"
                >
                  Disponible
                </p>

                <p
                  v-else
                  class="product-availability text-danger"
                >
                  Agotado
                </p>

              </template>

              <div class="row g-3 mt-1">

                <div class="col-sm-4">

                  <label
                    for="quantity"
                    class="form-label fw-semibold"
                  >
                    Cantidad
                  </label>

                  <input
                    id="quantity"
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="maximumQuantity"
                    class="form-control form-control-lg"
                    :disabled="!canPurchase"
                  >

                </div>

                <div class="col-sm-8 d-flex align-items-end">

                  <button
                    type="button"
                    class="btn btn-cafe88 btn-lg w-100"
                    :disabled="!canPurchase"
                    @click="addToCart"
                  >
                    Agregar al carrito
                  </button>

                </div>

              </div>

              <p
                v-if="!canPurchase"
                class="small text-muted mt-3 mb-0"
              >
                Este producto todavía no está disponible para compra.
              </p>

            </div>

          </div>

        </div>

      </section>

    </template>

  </div>
</template>

<script setup lang="ts">
type ProductCategory = {
  name: string
}

type ProductSubcategory = {
  name: string
}

type ProductTax = {
  tax_id: string
  name: string
  percent: number
}

type ProductStock = {
  measure_id: string
  name: string
  default: number
  quantity: number
  discount: number
  price: number
  status: string
}

type WarehouseProduct = {
  product_id: string
  code: string
  name: string
  short_name: string
  description: string
  image_url: string
  currency: string
  category: ProductCategory | null
  subcategory: ProductSubcategory | null
  taxes: ProductTax[]
  stock: ProductStock[]
}

const route = useRoute()

const productId = computed(() => {
  return String(route.params.product_id)
})

const {
  data: product,
  pending,
  error
} = await useFetch<WarehouseProduct>(
  () => `/api/products/${productId.value}`
)

const quantity = ref(1)
const selectedMeasureId = ref('')

const availableMeasures = computed(() => {
  return product.value?.stock?.filter(
    item => item.status === 'active'
  ) ?? []
})

watch(
  availableMeasures,
  measures => {
    if (!measures.length) {
      selectedMeasureId.value = ''
      return
    }

    const defaultMeasure =
      measures.find(item => item.default === 1) ||
      measures[0]

    selectedMeasureId.value =
      defaultMeasure?.measure_id ?? ''
  },
  {
    immediate: true
  }
)

const selectedStock = computed(() => {
  return availableMeasures.value.find(
    item => item.measure_id === selectedMeasureId.value
  ) ?? null
})

const hasPrice = computed(() => {
  return Number(selectedStock.value?.price ?? 0) > 0
})

const hasDiscount = computed(() => {
  return Number(selectedStock.value?.discount ?? 0) > 0
})

const isAvailable = computed(() => {
  return Number(selectedStock.value?.quantity ?? 0) > 0
})

const maximumQuantity = computed(() => {
  return Math.max(
    1,
    Math.floor(Number(selectedStock.value?.quantity ?? 1))
  )
})

const canPurchase = computed(() => {
  return Boolean(
    selectedStock.value &&
    hasPrice.value &&
    isAvailable.value
  )
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: product.value?.currency?.toUpperCase() || 'MXN'
  }).format(selectedStock.value?.price ?? 0)
})

function addToCart() {
  if (!canPurchase.value || !product.value || !selectedStock.value) {
    return
  }

  console.log('Pending cart integration:', {
    product_id: product.value.product_id,
    measure_id: selectedStock.value.measure_id,
    quantity: quantity.value,
    unit_price: selectedStock.value.price
  })
}

useHead(() => ({
  title: product.value
    ? `${product.value.short_name} | Cafe88`
    : 'Producto | Cafe88',

  meta: [
    {
      name: 'description',
      content:
        product.value?.description
          ?.replace(/\s+/g, ' ')
          .slice(0, 160) ||
        'Conoce los productos Cafe88.'
    }
  ]
}))
</script>