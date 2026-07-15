<template>
  <nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
    <div class="container">

      <NuxtLink class="navbar-brand d-flex align-items-center" to="/">
        <img src="/images/logo.jpeg" alt="Cafe88" height="42" class="me-2 navbar-logo">

        <span class="fw-bold">
          Cafe88
        </span>
      </NuxtLink>

      <div class="d-flex align-items-center ms-auto">

        <NuxtLink to="/cart" class="nav-link cart-nav-link cart-nav-mobile" aria-label="Abrir carrito">
          <i class="bi bi-cart3" aria-hidden="true" />

          <span v-if="itemCount > 0" class="cart-count">
            {{ itemCount > 99 ? '99+' : itemCount }}
          </span>
        </NuxtLink>

        <button class="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain"
          aria-controls="navbarMain" aria-expanded="false" aria-label="Abrir menú">
          <span class="navbar-toggler-icon" />
        </button>

      </div>

      <div id="navbarMain" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">

          <li class="nav-item">
            <NuxtLink class="nav-link" to="/">
              Inicio
            </NuxtLink>
          </li>

          <li class="nav-item">
            <NuxtLink class="nav-link" to="/products">
              Tienda
            </NuxtLink>
          </li>

          <li class="nav-item d-none d-lg-block">
            <NuxtLink to="/cart" class="nav-link cart-nav-link">
              Carrito

              <span v-if="itemCount > 0" class="cart-count">
                {{ itemCount > 99 ? '99+' : itemCount }}
              </span>
            </NuxtLink>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</template>

<script setup lang="ts">
const {
  itemCount,
  loadCart
} = useCart()

onMounted(async () => {
  try {
    await loadCart()
  } catch {
    // No cart yet is valid.
  }
})
</script>