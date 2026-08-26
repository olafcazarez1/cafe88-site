<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
    },
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      href: '/favicon-96x96.png'
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png'
    }
  ],

  meta: [
    {
      name: 'geo.position',
      content: '19.073978;-97.041904'
    },
    {
      name: 'ICBM',
      content: '19.073978, -97.041904'
    }
  ],

  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CafeOrCoffeeShop',

        name: 'Café88',
        url: 'https://cafe88.mx',
        telephone: '+522299063799',

        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Carretera Federal a Huatusco, casi esq. Matamoros',
          addressLocality: 'Coscomatepec de Bravo',
          addressRegion: 'Veracruz',
          postalCode: '94140',
          addressCountry: 'MX'
        },

        geo: {
          '@type': 'GeoCoordinates',
          latitude: 19.073978,
          longitude: -97.041904
        },

        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday'
            ],
            opens: '09:00',
            closes: '18:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '09:00',
            closes: '14:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Sunday',
            opens: '00:00',
            closes: '00:00'
          }
        ]
      })
    }
  ]
})
</script>