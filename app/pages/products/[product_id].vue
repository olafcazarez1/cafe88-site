<template>
  <div>

    <div v-if="pending" class="product-detail-state">
      <div class="spinner-border" role="status" aria-label="Cargando producto" />

      <p class="mt-3 mb-0">
        Cargando producto...
      </p>
    </div>

    <div v-else-if="error" class="product-detail-state">
      <h1 class="h3">
        Producto no disponible
      </h1>

      <p class="text-muted">
        No fue posible consultar este producto.
      </p>

      <NuxtLink to="/products" class="btn btn-cafe88">
        Volver a productos
      </NuxtLink>
    </div>

    <template v-else-if="product">

      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small mb-0">

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

          <li class="breadcrumb-item active">
            {{ product.short_name }}
          </li>

        </ol>
      </nav>

      <section class="product-detail-layout">

        <div class="row g-4 align-items-start">

          <!-- Image -->
          <div class="col-lg-4">
            <div class="product-detail-image-box">
              <img :src="product.image_url" :alt="product.short_name" class="product-detail-image">
            </div>
          </div>

          <!-- Product information -->
          <div class="col-lg-5">

            <div class="mb-2">
              <span class="product-category">
                {{ product.category?.name || 'Producto' }}
              </span>

              <span v-if="product.subcategory?.name" class="text-muted ms-2">
                · {{ product.subcategory.name }}
              </span>
            </div>

            <h1 class="product-detail-title">
              {{ product.short_name }}
            </h1>

            <p class="product-detail-code mb-3">
              Código: {{ product.code }}
            </p>

            <div class="product-detail-description">
              {{ product.description }}
            </div>

            <div v-if="product.taxes?.length" class="mt-4">
              <small class="text-muted">
                Impuestos aplicables:
                {{product.taxes.map(tax => tax.name).join(', ')}}
              </small>
            </div>

          </div>

          <!-- Purchase panel -->
          <div class="col-lg-3">

            <aside class="purchase-card">

              <template v-if="selectedStock">

                <div v-if="hasPrice" class="product-detail-price">
                  {{ formattedPrice }}
                </div>

                <p v-else class="text-muted mb-3">
                  Precio no disponible
                </p>

                <p v-if="hasDiscount" class="product-discount">
                  {{ selectedStock.discount }}% de descuento
                </p>

                <p v-if="isAvailable" class="product-availability text-success">
                  Stock disponible
                </p>

                <p v-else class="product-availability text-danger">
                  Agotado
                </p>

              </template>

              <div v-if="availableMeasures.length" class="mb-3">
                <label for="measure" class="form-label fw-semibold">
                  Presentación
                </label>

                <select id="measure" v-model="selectedMeasureId" class="form-select">
                  <option v-for="stockItem in availableMeasures" :key="stockItem.measure_id"
                    :value="stockItem.measure_id">
                    {{ stockItem.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">

                <label for="quantity" class="form-label fw-semibold">
                  Cantidad
                </label>

                <input id="quantity" v-model.number="quantity" type="number" min="1" :max="maximumQuantity"
                  class="form-control" :disabled="!canPurchase">

              </div>

              <button type="button" class="btn btn-cafe88 w-100 mb-2 add-cart-button"
                :class="{ 'is-added': addedToCart }" :disabled="!canPurchase || cartPending" @click="addToCart">
                <span v-if="cartPending" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />

                <span v-else-if="addedToCart">
                  ✓ Agregado al carrito
                </span>

                <span v-else>
                  Agregar al carrito
                </span>
              </button>

              <div v-if="cartError" class="alert alert-danger py-2 mt-3 mb-0">
                {{ cartError }}
              </div>

              <button type="button" class="btn btn-outline-dark w-100" :disabled="!canPurchase || cartPending"
                @click="buyNow">
                Comprar ahora
              </button>

              <p v-if="!canPurchase" class="small text-muted mt-3 mb-0">
                Este producto todavía no está disponible para compra.
              </p>

            </aside>

          </div>

        </div>

      </section>

      <div class="related-products-wrapper">

        <button v-show="showLeftButton" class="related-nav related-nav-left" @click="scrollRelated(-1)">
          <i class="bi bi-chevron-left"></i>
        </button>

        <div ref="relatedContainer" class="related-products-list" @scroll="updateNavigation">
          <section v-if="relatedProducts.length" class="related-products-section mt-5">
            <div class="mb-3">
              <span class="products-eyebrow">
                También te puede interesar
              </span>

              <h2 class="related-products-title mb-0">
                Productos relacionados
              </h2>
            </div>

            <div class="related-products-list">
              <NuxtLink v-for="relation in relatedProducts" :key="relation.item_id"
                :to="`/products/${relation.product.product_id}`" class="related-product-card">
                <div class="related-product-image-wrapper">
                  <img :src="getRelatedProductImage(
                    relation.product.image
                  )" :alt="relation.product.short_name ||
                    relation.product.name
                    " class="related-product-image" loading="lazy">
                </div>

                <div class="related-product-content">
                  <h3 class="related-product-name">
                    {{
                      relation.product.short_name ||
                      relation.product.name
                    }}
                  </h3>

                  <div class="related-product-code">
                    {{ relation.product.code }}
                  </div>

                  <div class="related-product-measure">
                    {{ relation.measure?.name }}
                  </div>

                  <div class="related-product-footer">
                    <div>
                      <div v-if="getRelatedProductPrice(relation) > 0" class="related-product-price">
                        {{
                          formatCurrency(
                            getRelatedProductPrice(relation)
                          )
                        }}
                      </div>

                      <div class="related-product-measure">
                        {{ relation.measure?.name }}
                      </div>
                    </div>

                    <span class="related-product-arrow">
                      <i class="bi bi-arrow-right" />
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </section>
        </div>

        <button v-show="showRightButton" class="related-nav related-nav-right" @click="scrollRelated(1)">
          <i class="bi bi-chevron-right"></i>
        </button>

      </div>



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
  related?: ProductRelation[]
}

type RelatedMeasure = {
  measure_id: string
  code: string
  name: string
  status: string
  price?: number
  discount?: number
  quantity?: number
}

type RelatedProductData = {
  product_id: string
  code: string
  name: string
  short_name: string
  description: string
  image: string
  currency: string
  status: string
}

type ProductRelation = {
  product_id: string
  item_id: string
  measure_id: string
  quantity: number
  status: string
  product: RelatedProductData
  measure: RelatedMeasure
}

const {
  addItem,
  pending: cartPending
} = useCart()

const addedToCart = ref(false)
const cartError = ref('')

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

const maximumQuantity = 10

// const maximumQuantity = computed(() => {
//   return Math.max(
//     1,
//     Math.floor(Number(selectedStock.value?.quantity ?? 1))
//   )
// })

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

const relatedProducts = computed<ProductRelation[]>(() => {
  const currentProductId = product.value?.product_id

  if (!currentProductId) {
    return []
  }

  const seen = new Set<string>()

  return (product.value?.related ?? []).filter((relation) => {
    const relatedProductId =
      relation.product?.product_id ??
      relation.item_id

    if (
      relation.status !== 'active' ||
      relation.product?.status !== 'active' ||
      relatedProductId === currentProductId ||
      seen.has(relatedProductId)
    ) {
      return false
    }

    seen.add(relatedProductId)

    return true
  })
})

async function addCurrentProductToCart() {
  await addItem({
    product_id: product.value!.product_id,
    measure_id: selectedStock.value!.measure_id,
    quantity: quantity.value
  })
}

async function addToCart() {
  if (!canPurchase.value || !product.value || !selectedStock.value) {
    return
  }

  cartError.value = ''
  addedToCart.value = false

  try {
    await addCurrentProductToCart()

    addedToCart.value = true

    window.setTimeout(() => {
      addedToCart.value = false
    }, 1800)
  } catch {
    cartError.value =
      'No fue posible agregar el producto al carrito.'
  }
}

async function buyNow() {
  if (!canPurchase.value || !product.value || !selectedStock.value) {
    return
  }

  cartError.value = ''

  try {
    await addCurrentProductToCart()

    await navigateTo('/cart')
  } catch {
    cartError.value =
      'No fue posible agregar el producto al carrito.'
  }
}

function getRelatedProductImage(image?: string): string {
  if (!image) {
    return '/images/product-placeholder.png'
  }

  return `/api/product-image?path=${encodeURIComponent(image)}`
}

function getRelatedProductPrice(
  relation: ProductRelation
): number {
  return Number(
    relation.measure?.price ??
    relation.product?.price ??
    0
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value)
}

const relatedContainer = ref<HTMLElement>()

const showLeftButton = ref(false)
const showRightButton = ref(false)

function updateNavigation() {
  const container = relatedContainer.value

  if (!container) return

  showLeftButton.value = container.scrollLeft > 10

  showRightButton.value =
    container.scrollLeft <
    container.scrollWidth -
    container.clientWidth -
    10
}

function scrollRelated(direction: number) {
  const container = relatedContainer.value

  if (!container) {
    return
  }

  const card = container.querySelector<HTMLElement>(
    '.related-product-card'
  )

  if (!card) {
    return
  }

  const styles = window.getComputedStyle(container)
  const gap = parseFloat(styles.columnGap || styles.gap) || 0
  const cardWidth = card.offsetWidth + gap

  const visibleCards = Math.max(
    1,
    Math.floor(
      (container.clientWidth + gap) / cardWidth
    )
  )

  const cardsToMove =
    window.innerWidth < 576
      ? 1
      : visibleCards

  container.scrollBy({
    left: direction * cardWidth * cardsToMove,
    behavior: 'smooth'
  })
}

onMounted(() => {
  nextTick(updateNavigation)
})

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