import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true },
  
  modules: [
    'shadcn-nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt'
  ],
  
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui'
  },
  
  css: ['~/assets/css/tailwind.css'],
  
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://vta-app.test',
          changeOrigin: true,
          secure: false
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://vta-app.test/api'
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