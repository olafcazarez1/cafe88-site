export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    erpBaseUrl: process.env.ERP_BASE_URL || 'http://erp.cafe88.org',
    erpApiToken: process.env.ERP_API_TOKEN || '',
    erpWarehouseId: process.env.ERP_WAREHOUSE_ID || '',

    public: {
      siteName: 'Cafe88'
    }
  },

  devtools: {
    enabled: true
  }
})