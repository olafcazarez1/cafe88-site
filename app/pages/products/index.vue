<template>
  <div>

    <header class="products-header text-center mb-5">
      <span class="products-eyebrow">
        Café 88 · Faja de Oro
      </span>

      <h1 class="fw-bold mt-2">
        Nuestros productos
      </h1>

      <p class="text-muted mx-auto">
        Descubre nuestro café veracruzano de especialidad y la línea
        gourmet elaborada con café orgánico.
      </p>
    </header>

    <section class="products-toolbar mb-4">

      <form
        class="row g-3 align-items-center"
        @submit.prevent="searchProducts"
      >
        <div class="col-md">

          <label
            for="product-search"
            class="visually-hidden"
          >
            Buscar productos
          </label>

          <input
            id="product-search"
            v-model.trim="searchInput"
            type="search"
            class="form-control form-control-lg"
            placeholder="Buscar café, salsa, cafeta..."
          >

        </div>

        <div class="col-md-auto">
          <button
            type="submit"
            class="btn btn-cafe88 btn-lg w-100"
          >
            Buscar
          </button>
        </div>

        <div
          v-if="searchTerm"
          class="col-md-auto"
        >
          <button
            type="button"
            class="btn btn-outline-secondary btn-lg w-100"
            @click="clearSearch"
          >
            Limpiar
          </button>
        </div>
      </form>

    </section>

    <div
      v-if="pending"
      class="products-state"
    >
      <div
        class="spinner-border"
        role="status"
        aria-label="Cargando productos"
      />
      <p class="mt-3 mb-0">
        Cargando productos...
      </p>
    </div>

    <div
      v-else-if="error"
      class="alert alert-danger"
      role="alert"
    >
      No fue posible cargar los productos en este momento.
    </div>

    <template v-else>

      <div
        v-if="products.length"
        class="row g-4"
      >
        <div
          v-for="product in products"
          :key="product.product_id"
          class="col-sm-6 col-lg-4"
        >
          <ProductsProductCard :product="product" />
        </div>
      </div>

      <div
        v-else
        class="products-state"
      >
        <h2 class="h4">
          No encontramos productos
        </h2>

        <p class="text-muted mb-0">
          Prueba con otro nombre o categoría.
        </p>
      </div>

      <nav
        v-if="totalPages > 1"
        class="d-flex justify-content-center mt-5"
        aria-label="Paginación de productos"
      >
        <ul class="pagination">

          <li
            class="page-item"
            :class="{ disabled: currentPage === 1 }"
          >
            <button
              type="button"
              class="page-link"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Anterior
            </button>
          </li>

          <li class="page-item disabled">
            <span class="page-link">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
          </li>

          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <button
              type="button"
              class="page-link"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Siguiente
            </button>
          </li>

        </ul>
      </nav>

    </template>

  </div>
</template>

<script setup lang="ts">

type ProductCategory = {
  category_id: string
  code: string
  name: string
}

type ProductSubcategory = {
  subcategory_id: string
  code: string
  name: string
}

type Product = {
  product_id: string
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

type ProductsResponse = {
  results: Product[]
  total_rows: number
  offset: number
  limit: number
}

const route = useRoute()
const router = useRouter()

const limit = 12

const searchInput = ref(
  typeof route.query.q === 'string'
    ? route.query.q
    : ''
)

const searchTerm = computed(() => {
  return typeof route.query.q === 'string'
    ? route.query.q
    : ''
})

const currentPage = computed(() => {
  const page = Number(route.query.page ?? 1)

  return Number.isFinite(page) && page > 0
    ? Math.floor(page)
    : 1
})

const offset = computed(() => {
  return (currentPage.value - 1) * limit
})

const {
  data,
  pending,
  error
} = await useFetch<ProductsResponse>('/api/products', {
  query: computed(() => ({
    offset: offset.value,
    limit,
    look_for: searchTerm.value
  })),

  watch: [
    offset,
    searchTerm
  ],

  default: () => ({
    results: [],
    total_rows: 0,
    offset: 0,
    limit
  })
})

const products = computed(() => data.value?.results ?? [])
const totalRows = computed(() => data.value?.total_rows ?? 0)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalRows.value / limit))
})

async function searchProducts() {
  await router.push({
    query: {
      ...(searchInput.value
        ? { q: searchInput.value }
        : {})
    }
  })
}

async function clearSearch() {
  searchInput.value = ''

  await router.push({
    query: {}
  })
}

async function changePage(page: number) {
  if (page < 1 || page > totalPages.value) {
    return
  }

  await router.push({
    query: {
      ...(searchTerm.value
        ? { q: searchTerm.value }
        : {}),

      ...(page > 1
        ? { page: String(page) }
        : {})
    }
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>