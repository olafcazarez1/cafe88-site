<template>
  <div>

    <!-- Hero -->
    <section class="hero-section rounded-4 p-5 mb-5">
      <div class="row align-items-center">

        <div class="col-md-7">
          <h1 class="hero-title">
            Café Veracruzano de Altura
          </h1>

          <p class="hero-subtitle mt-3">
            Tradición, aroma y pasión en cada taza.
          </p>

          <div class="mt-4">
            <NuxtLink
              to="/products"
              class="btn btn-cafe88 btn-lg me-2"
            >
              Ver Productos
            </NuxtLink>

            <a
              href="#conocenos"
              class="btn btn-outline-dark btn-lg"
            >
              Conócenos
            </a>
          </div>
        </div>

        <div class="col-md-5 text-center mt-4 mt-md-0">
          <img
            src="/images/products/cafe88-black.jpg"
            alt="Cafe88"
            class="img-fluid hero-product"
          >
        </div>

      </div>
    </section>

    <!-- Trust badges -->
    <section class="row text-center mb-5">

      <div class="col-md-4 mb-3">
        <div class="trust-badge">
          <h5>Veracruzano</h5>
          <p>Café de altura con identidad regional.</p>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="trust-badge">
          <h5>Orgánico</h5>
          <p>Producto seleccionado con calidad premium.</p>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="trust-badge">
          <h5>Gourmet</h5>
          <p>Café y derivados elaborados con tradición.</p>
        </div>
      </div>

    </section>

    <!-- Products -->
    <section class="mb-5">

      <div class="text-center mb-4">
        <h2 class="fw-bold">
          Nuestros Productos
        </h2>

        <p class="text-muted">
          Café veracruzano y productos gourmet elaborados con tradición.
        </p>
      </div>

      <div class="row g-4">

        <div
          class="col-md-4"
          v-for="product in featuredProducts"
          :key="product.id"
        >
          <div class="card product-card h-100">

            <div class="product-image-wrapper">
              <img
                :src="product.image"
                :alt="product.name"
                class="product-card-image"
              >
            </div>

            <div class="card-body text-center">

              <h5 class="fw-bold">
                {{ product.name }}
              </h5>

              <p class="small text-muted">
                {{ product.description }}
              </p>

              <NuxtLink
                to="/products"
                class="btn btn-cafe88 btn-sm"
              >
                Ver producto
              </NuxtLink>

            </div>

          </div>
        </div>

      </div>

    </section>

    <!-- Difference -->
    <section class="difference-section-dark rounded-4 p-5 mb-5">

      <div class="row align-items-center">

        <div class="col-md-6 mb-4 mb-md-0">
          <img
            src="/images/products/cafe88-bags.jpg"
            alt="Cafe88 productos"
            class="img-fluid rounded-4 shadow-lg"
          >
        </div>

        <div class="col-md-6">
          <h2 class="fw-bold mb-3">
            Nuestra diferencia
          </h2>

          <p class="fs-5">
            Café 88 es un café orgánico de especialidad cultivado
            entre los 1400 y 1500 msnm en las montañas de Veracruz,
            reconocido por su calidad, dulzura y atributos en taza.
          </p>

          <p>
            Finalista del “Premio a la Cosecha 2009”, finalista de
            “Excellence Cup 2012” y del “2º Premio CAFECOL 2012”,
            además de recibir menciones honoríficas por su dulzura,
            acidez y perfil sensorial.
          </p>

          <ul class="list-unstyled mt-4">
            <li class="mb-2">☕ Café de especialidad</li>
            <li class="mb-2">⛰️ Cultivado a 1400–1500 msnm</li>
            <li class="mb-2">🏆 Reconocimientos nacionales</li>
          </ul>

          <NuxtLink
            to="/products"
            class="btn btn-light mt-3"
          >
            Ver productos
          </NuxtLink>
        </div>

      </div>

    </section>

    <!-- Conocenos -->
    <section
      id="conocenos"
      class="card section-card mb-5"
    >
      <div class="card-body p-4 p-md-5">

        <h2 class="fw-bold mb-3">
          Conócenos
        </h2>

        <p class="fs-5">
          Somos una empresa veracruzana dedicada a ofrecer café premium
          y productos gourmet elaborados con pasión, tradición y calidad.
        </p>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Integer vitae justo sed lorem interdum consequat. Curabitur
          fermentum, ipsum non tincidunt dignissim, erat ligula
          pellentesque lorem, vitae porta justo neque at arcu.
        </p>

      </div>
    </section>

    <!-- History -->
    <section class="card section-card mb-5">
      <div class="card-body p-4 p-md-5">

        <h2 class="fw-bold mb-3">
          Nuestra Historia
        </h2>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Suspendisse potenti. Integer non turpis sed ipsum malesuada
          vestibulum. Curabitur luctus, mauris vel vulputate aliquet,
          risus libero tincidunt justo, vel feugiat magna ipsum sed lorem.
        </p>

        <p>
          Vivamus malesuada, sapien non tincidunt malesuada, lectus ligula
          gravida risus, et elementum neque turpis et sapien. Sed tristique
          dignissim nisl, sed volutpat velit aliquet nec.
        </p>

      </div>
    </section>

    <!-- Mission / Vision -->
    <section class="row mb-5">

      <div class="col-md-6">
        <div class="card section-card h-100 mb-4">
          <div class="card-body p-4">

            <h3 class="fw-bold">
              Misión
            </h3>

            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
              Nuestro compromiso es ofrecer productos de calidad con
              identidad veracruzana.
            </p>

          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card section-card h-100 mb-4">
          <div class="card-body p-4">

            <h3 class="fw-bold">
              Visión
            </h3>

            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
              Buscamos compartir el sabor y la tradición del café mexicano.
            </p>

          </div>
        </div>
      </div>

    </section>

  </div>
</template>

<script setup>
const featuredProducts = [
  {
    id: 1,
    name: 'Cafe88 Orgánico',
    description: 'Café veracruzano premium de altura.',
    image: '/images/products/cafe88-black.jpg'
  },
  {
    id: 2,
    name: 'Jalea de Café',
    description: 'Producto gourmet artesanal.',
    image: '/images/products/jalea-cafe.jpg'
  },
  {
    id: 3,
    name: 'Salsa de Café',
    description: 'Sabor gourmet inspirado en café.',
    image: '/images/products/salsa-cafe.jpg'
  }
]
</script>