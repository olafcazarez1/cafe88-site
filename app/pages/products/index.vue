<template>
  <div>
    <header class="store-header">
      <div>
        <h1>
          Nuestros productos
        </h1>

        <p>
          Café de especialidad y productos Café88.
        </p>
      </div>
    </header>

    <section class="catalog-toolbar mb-4">
      <div class="products-search-field">
        <i class="bi bi-search" aria-hidden="true" />

        <input v-model="searchInput" type="search" class="form-control" placeholder="Buscar productos..."
          aria-label="Buscar productos" autocomplete="off" @keyup.esc="clearSearch">

        <button v-if="searchInput" type="button" class="products-search-clear" aria-label="Limpiar búsqueda"
          @click="clearSearch">
          <i class="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>
    </section>



    <div v-if="pending" class="products-state">
      <div class="spinner-border" role="status" aria-label="Cargando productos" />

      <p class="mt-3 mb-0">
        Cargando productos...
      </p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      No fue posible cargar los productos en este momento.
    </div>

    <template v-else>
      <div v-if="products.length" class="row g-4">
        <div v-for="product in products" :key="product.product_id" class="col-sm-6 col-lg-4">
          <ProductsProductCard :product="product" />
        </div>
      </div>

      <div v-else class="products-state">
        <h2 class="h4">
          No encontramos productos
        </h2>

        <p class="text-muted mb-3">
          Prueba con otro nombre o categoría.
        </p>

        <button v-if="searchInput" type="button" class="btn btn-outline-secondary" @click="clearSearch">
          Limpiar búsqueda
        </button>
      </div>

      <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-5" aria-label="Paginación de productos">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button type="button" class="page-link" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
              Anterior
            </button>
          </li>

          <li class="page-item disabled">
            <span class="page-link">
              Página {{ currentPage }} de {{ totalPages }}
            </span>
          </li>

          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button type="button" class="page-link" :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)">
              Siguiente
            </button>
          </li>
        </ul>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">

const CATEGORY_ORDER: Record<string, number> = {
  // Café
  '43f95e64-28be-4464-9f3b-9116b19e1b18': 10,

  // Derivados de Café
  'b85b83af-36a1-47cc-af92-50c21071a8f3': 20,

  // Merchandising
  '4b0fe15e-c60e-463e-82b5-6f6bc3be8f47': 30
}

const SUBCATEGORY_ORDER: Record<string, number> = {
  // Café
  'fba06bc4-993f-4798-82d4-985406449d58': 10, // Molido
  '80ce541b-d162-4ba8-9e48-08683b2ae48a': 20, // Grano

  // Derivados de Café
  'c8fc160b-34a9-40fe-bb82-24daa2133d67': 10, // Salsas
  '3fc6800d-624c-479c-a50e-a5446ec3be3b': 20, // Mermeladas
  'd947a84f-9366-41e0-aac8-39e278a463d5': 30, // Confitería
  'c63e183b-b810-4974-888c-f45d8f2e7d56': 40, // Bebidas de Café

  // Merchandising
  'f679ad59-1a78-490e-9836-8a5ab1eab003': 10 // Tazas
}

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
const searchDelay = 350

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

const products = computed(() => {
  return [...(data.value?.results ?? [])].sort((a, b) => {
    const categoryA =
      CATEGORY_ORDER[
      a.category?.category_id ?? ''
      ] ?? 999

    const categoryB =
      CATEGORY_ORDER[
      b.category?.category_id ?? ''
      ] ?? 999

    if (categoryA !== categoryB) {
      return categoryA - categoryB
    }

    const subcategoryA =
      SUBCATEGORY_ORDER[
      a.subcategory?.subcategory_id ?? ''
      ] ?? 999

    const subcategoryB =
      SUBCATEGORY_ORDER[
      b.subcategory?.subcategory_id ?? ''
      ] ?? 999

    if (subcategoryA !== subcategoryB) {
      return subcategoryA - subcategoryB
    }

    return (a.short_name || a.name).localeCompare(
      b.short_name || b.name,
      'es',
      {
        sensitivity: 'base'
      }
    )
  })
})
const totalRows = computed(() => data.value?.total_rows ?? 0)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalRows.value / limit))
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchInput, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(async () => {
    const normalizedValue = value.trim()

    if (normalizedValue === searchTerm.value) {
      return
    }

    await router.replace({
      query: {
        ...(normalizedValue
          ? { q: normalizedValue }
          : {})
      }
    })
  }, searchDelay)
})

watch(searchTerm, (value) => {
  if (searchInput.value !== value) {
    searchInput.value = value
  }
})


onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

async function clearSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchInput.value = ''

  await router.replace({
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

async function selectCategory(categoryId: string) {
  await router.replace({
    query: {
      ...(searchTerm.value
        ? { q: searchTerm.value }
        : {}),

      ...(categoryId
        ? { category: categoryId }
        : {})
    }
  })
}

async function selectSubcategory(
  subcategoryId: string
) {
  await router.replace({
    query: {
      ...(searchTerm.value
        ? { q: searchTerm.value }
        : {}),

      ...(selectedCategoryId.value
        ? {
          category:
            selectedCategoryId.value
        }
        : {}),

      ...(subcategoryId
        ? {
          subcategory: subcategoryId
        }
        : {})
    }
  })
}

async function onCategoryChange(event: Event) {
  const categoryId =
    (event.target as HTMLSelectElement).value

  await selectCategory(categoryId)
}

async function onSubcategoryChange(event: Event) {
  const subcategoryId =
    (event.target as HTMLSelectElement).value

  await selectSubcategory(subcategoryId)
}
</script>
