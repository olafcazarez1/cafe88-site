<template>
  <div>

    <AppNavbar />

    <main class="container mt-4 mb-5">
      <slot />
    </main>

    <a href="https://wa.me/522299063799" class="whatsapp-support-button" target="_blank" rel="noopener noreferrer">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"
        aria-hidden="true">
        <path
          d="M20.52 3.48A11.82 11.82 0 0012.04 0C5.42 0 .04 5.38.04 12c0 2.11.55 4.17 1.59 5.99L0 24l6.18-1.62A11.94 11.94 0 0012.04 24c6.62 0 12-5.38 12-12 0-3.21-1.25-6.22-3.52-8.52zm-8.48 18.5a9.96 9.96 0 01-5.08-1.39l-.36-.21-3.67.96.98-3.58-.24-.37A9.96 9.96 0 1122 12c0 5.51-4.48 9.98-9.96 9.98zm5.46-7.45c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.48.71.3 1.26.48 1.69.61.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z" />
      </svg>
    </a>

    <footer class="container pb-3">

      <div class="d-flex justify-content-end">
        <a href="http://wesmexico.com" target="_blank">
          <img src="/images/poweredby.png" alt="Powered by WES Mexico" height="16">
        </a>
      </div>

    </footer>

  </div>
</template>