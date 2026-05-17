<template>
  <nav class="navbar navbar-expand-lg navbar-dark navbar-custom">
    <div class="container">

      <NuxtLink
        class="navbar-brand d-flex align-items-center"
        to="/"
      >
        <img
        src="/images/logo.jpeg"
        alt="Cafe88"
        height="42"
        class="me-3 navbar-logo"
        />
        <span class="fw-bold">
          Cafe88
        </span>
      </NuxtLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarMain"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        id="navbarMain"
        class="collapse navbar-collapse"
      >
        <ul class="navbar-nav ms-auto">

          <li class="nav-item">
            <NuxtLink class="nav-link" to="/">
              Inicio
            </NuxtLink>
          </li>

          <li class="nav-item">
            <NuxtLink class="nav-link" to="/products">
              Productos
            </NuxtLink>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</template>