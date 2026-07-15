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

          <div class="d-grid gap-2 mt-4 hero-actions-mobile">
            <NuxtLink to="/products" class="btn btn-cafe88 btn-lg">
              Ver Productos
            </NuxtLink>

            <a href="#conocenos" class="btn btn-outline-dark btn-lg">
              Conócenos
            </a>
          </div>
        </div>

        <div class="col-md-5 text-center mt-4 mt-md-0">
          <img src="/images/products/cafe88-black.jpg" alt="Cafe88" class="img-fluid hero-product">
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

        <div class="col-md-4" v-for="product in featuredProducts" :key="product.id">
          <div class="card product-card h-100">

            <div class="product-image-wrapper">
              <img :src="product.image" :alt="product.name" class="product-card-image">
            </div>

            <div class="card-body text-center">

              <h5 class="fw-bold">
                {{ product.name }}
              </h5>

              <p class="small text-muted">
                {{ product.description }}
              </p>

              <NuxtLink to="/products" class="btn btn-cafe88 btn-sm">
                Ver producto
              </NuxtLink>

            </div>

          </div>
        </div>

      </div>

    </section>

    <!-- Difference -->
    <section class="difference-section-dark rounded-4 p-5 mb-5">

      <div class="row align-items-center g-5">

        <div class="col-lg-6">
          <img src="/images/products/cafe88-and-mug.jpg" alt="Café88 Orgánico" class="img-fluid rounded-4 shadow-lg">
        </div>

        <div class="col-lg-6">

          <span class="difference-eyebrow">
            DESDE LAS MONTAÑAS DE VERACRUZ
          </span>

          <h2 class="fw-bold display-5 mt-2 mb-4">
            Del origen a tu taza
          </h2>

          <p class="lead mb-4">
            <strong>Café88</strong> nace en las montañas de Veracruz,
            donde cada grano se cultiva entre
            <strong>1,400 y 1,500 msnm</strong>,
            logrando un perfil de taza con dulzura natural,
            acidez balanceada y notas únicas.
          </p>

          <p class="mb-4">
            Nuestro café ha sido reconocido como finalista del
            <strong>Premio a la Cosecha 2009</strong>,
            <strong>Excellence Cup 2012</strong>
            y del
            <strong>2.º Premio CAFECOL 2012</strong>,
            reflejando el compromiso de nuestros productores con la calidad.
          </p>

          <div class="row g-3 mb-4">

            <div class="col-12">
              ☕ <strong>Café de especialidad</strong><br>
              <small class="text-light opacity-75">
                Selección artesanal de granos.
              </small>
            </div>

            <div class="col-12">
              🌱 <strong>Producción orgánica</strong><br>
              <small class="text-light opacity-75">
                Cultivado de forma responsable.
              </small>
            </div>

            <div class="col-12">
              🏆 <strong>Reconocimiento internacional</strong><br>
              <small class="text-light opacity-75">
                Premiado por su calidad y perfil sensorial.
              </small>
            </div>

          </div>

          <NuxtLink to="/products" class="btn btn-light btn-lg px-4">
            Descubrir nuestros productos
          </NuxtLink>

        </div>

      </div>

    </section>

    <!-- Conocenos -->
    <section id="conocenos" class="card section-card mb-5">
      <div class="card-body p-4 p-md-5">

        <span class="products-eyebrow">
          Cerro de la Troje
        </span>

        <h2 class="fw-bold mt-2 mb-4">
          Tradición e innovación
        </h2>

        <p class="fs-5">
          Desde 2004, en Cerro de la Troje cultivamos el orgullo de ser una
          empresa 100% veracruzana, comprometida con la calidad, el bienestar
          de nuestros clientes y el respeto por nuestro entorno natural.
        </p>

        <p>
          Para llevar esta pasión a tu mesa, hemos desarrollado dos marcas
          que expresan distintas formas de disfrutar la riqueza del café:
          Café 88 y Faja de Oro.
        </p>

        <div class="row g-4 mt-3">

          <div class="col-md-6">
            <div class="brand-story-card h-100">

              <h3 class="h4 fw-bold">
                Café 88
              </h3>

              <p class="brand-story-subtitle">
                La excelencia en cada grano
              </p>

              <p>
                Nuestro café orgánico y de especialidad crece bajo el bosque
                de niebla de Chocamán, Veracruz, en la Finca Las Ceibas,
                ubicada entre los 1,400 y 1,500 msnm.
              </p>

              <p class="mb-0">
                Su perfil destaca por su dulzura, acidez limpia y atributos
                excepcionales en taza.
              </p>

            </div>
          </div>

          <div class="col-md-6">
            <div class="brand-story-card h-100">

              <h3 class="h4 fw-bold">
                Faja de Oro
              </h3>

              <p class="brand-story-subtitle">
                El lado gourmet del café
              </p>

              <p>
                Inspirada en la zona montañosa central de Veracruz, Faja de Oro
                transforma la riqueza del café en experiencias culinarias
                únicas.
              </p>

              <p class="mb-0">
                Nuestra línea incluye salsas artesanales, jaleas aromáticas,
                confitería y otros productos gourmet elaborados con procesos
                de alta calidad.
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- History -->
    <section class="card section-card mb-5">
      <div class="card-body p-4 p-md-5">

        <span class="products-eyebrow">
          Desde 2004
        </span>

        <h2 class="fw-bold mt-2 mb-4">
          Nuestra Historia
        </h2>

        <p class="fs-5">
          Cerro de la Troje nació con una misión clara: devolverle el valor
          justo al esfuerzo de nuestra tierra.
        </p>

        <p>
          Durante la década de los noventa, las crisis cafetaleras afectaron
          profundamente a pequeños productores y cortadores. Ante esta
          realidad, decidimos alejarnos de los mercados masivos y enfocarnos
          en lo extraordinario: el café de especialidad.
        </p>

        <p>
          Cada grano requiere cuidado artesanal, precisión y respeto por los
          tiempos de la naturaleza. Por eso mantenemos un compromiso constante
          con la excelencia técnica, el comercio justo y la trazabilidad de
          nuestros productos.
        </p>

        <p class="history-closing mb-0">
          De nuestra plantación a tu taza. Descubre el verdadero sabor del
          café de especialidad.
        </p>

      </div>
    </section>

    <!-- Mission / Vision -->
    <section class="row g-4 mb-5">

      <div class="col-md-6">
        <article class="card section-card h-100">
          <div class="card-body p-4 p-md-5">

            <span class="products-eyebrow">
              Nuestro propósito
            </span>

            <h2 class="h3 fw-bold mt-2 mb-3">
              Misión
            </h2>

            <p class="mb-0">
              Producir y comercializar café orgánico de especialidad y
              productos gourmet derivados de la más alta calidad, honrando
              el trabajo de los productores veracruzanos y preservando el
              entorno natural, para entregar en cada taza y en cada producto
              una experiencia única que supere las expectativas de los
              paladares más exigentes.
            </p>

          </div>
        </article>
      </div>

      <div class="col-md-6">
        <article class="card section-card h-100">
          <div class="card-body p-4 p-md-5">

            <span class="products-eyebrow">
              Hacia 2031
            </span>

            <h2 class="h3 fw-bold mt-2 mb-3">
              Visión
            </h2>

            <p class="mb-0">
              Ser reconocidos a nivel nacional como la marca referente de café
              de especialidad y productos gourmet de Veracruz, consolidando a
              Café 88 y Faja de Oro en el mercado digital y comercial, siempre
              con un firme compromiso con el comercio justo, la innovación
              culinaria y la excelencia.
            </p>

          </div>
        </article>
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
    name: 'Cafeta',
    description: 'Producto gourmet artesanal.',
    image: '/images/products/cajeta-cafe.jpg'
  },
  {
    id: 3,
    name: 'Salsa de Café',
    description: 'Sabor gourmet inspirado en café.',
    image: '/images/products/salsa-cafe.jpg'
  }
]
</script>