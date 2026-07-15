export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    erpBaseUrl: process.env.ERP_BASE_URL || 'http://erp.cafe88.org',
    erpApiToken: process.env.ERP_API_TOKEN || '',
    erpWarehouseId: process.env.ERP_WAREHOUSE_ID || '',
    erpBranchId: process.env.ERP_BRANCH_ID || '',
    erpClientId: process.env.ERP_CLIENT_ID || '',

    paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',

    public: {
      siteName: 'Cafe88',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || ''
    }
  },

  devtools: {
    enabled: true
  }
})