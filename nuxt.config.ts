import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', 'shadcn-nuxt'],
  
  css: ['~/app/assets/css/tailwind.css'],
  
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://vta.test/api'
    }
  },

  pwa: {
    manifest: {
      name: 'VTA',
      short_name: 'VTA',
      description: 'Flight Management Application',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: false
    }
  },

  typescript: {
    strict: false,
    typeCheck: false
  }
})