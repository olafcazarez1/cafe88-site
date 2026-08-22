export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'Café 88 y Faja de Oro',

      meta: [
        {
          name: 'description',
          content: 'Café veracruzano de altura y productos gourmet elaborados con tradición, calidad y pasión.'
        },

        {
          property: 'og:title',
          content: 'Café 88 y Faja de Oro'
        },
        {
          property: 'og:description',
          content: 'Café veracruzano de altura y productos gourmet elaborados con tradición, calidad y pasión.'
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:url',
          content: 'https://cafe88.mx/'
        },
        {
          property: 'og:image',
          content: 'https://cafe88.mx/images/social/cafe88.png'
        },
        {
          property: 'og:image:width',
          content: '512'
        },
        {
          property: 'og:image:height',
          content: '512'
        },
        {
          property: 'og:image:alt',
          content: 'Café 88'
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ],

      link: [
        {
          rel: 'canonical',
          href: 'https://cafe88.mx/'
        }
      ]
    }
  },

  runtimeConfig: {
    erpBaseUrl: process.env.ERP_BASE_URL || 'http://erp.cafe88.org',
    erpApiToken: process.env.ERP_API_TOKEN || '',
    erpWarehouseId: process.env.ERP_WAREHOUSE_ID || '',
    erpBranchId: process.env.ERP_BRANCH_ID || '',
    erpClientId: process.env.ERP_CLIENT_ID || '',

    paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID || '',

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