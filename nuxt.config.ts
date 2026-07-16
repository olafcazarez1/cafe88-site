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

    mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    mercadoPagoWebhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || '',
    mercadoPagoBaseUrl: process.env.MERCADO_PAGO_BASE_URL || '',

    public: {
      siteName: 'Cafe88',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
      mercadoPagoPublicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
    }
  },

  build: {
    transpile: ['mercadopago']
  },

  nitro: {
    externals: {
      inline: ['mercadopago']
    }
  },

  devtools: {
    enabled: true
  }
})