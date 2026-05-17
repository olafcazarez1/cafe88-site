<template>
  <div>

    <AppNavbar />

    <main class="container mt-4 mb-5">
      <slot />
    </main>

    <footer class="container pb-3">

    <div class="d-flex justify-content-end">
        <a
        href="http://wesmexico.com"
        target="_blank"
        >
        <img
            src="/images/poweredby.png"
            alt="Powered by WES Mexico"
            height="16"
        >
        </a>
    </div>

    </footer>

  </div>
</template>