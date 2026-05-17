<template>
  <div>

    <h1 class="mb-4">
      Products
    </h1>

    <div class="row">

      <div
        class="col-md-4"
        v-for="product in products"
        :key="product.id"
      >
        <div class="card mb-4">

          <img
            :src="product.image"
            class="card-img-top"
          >

          <div class="card-body">

            <h5 class="card-title">
              {{ product.name }}
            </h5>

            <p class="card-text">
              {{ product.description }}
            </p>

            <button class="btn btn-dark">
              View Product
            </button>

          </div>

        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
const products = [
  {
    id: 1,
    name: 'Cafe88 Veracruz',
    description: 'Organic premium coffee.',
    image: 'https://picsum.photos/400/300'
  },
  {
    id: 2,
    name: 'Faja de Oro Gourmet',
    description: 'Traditional gourmet coffee.',
    image: 'https://picsum.photos/401/300'
  }
]
</script>