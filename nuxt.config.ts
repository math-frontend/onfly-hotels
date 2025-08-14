// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/google-fonts'
  ],
  css: [
    '~/assets/styles/main.scss'
  ],
  googleFonts: {
    families: {
      Poppins: {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700]
      },
      Roboto: {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700]
      }
    },
    display: 'swap',
    prefetch: true,
    preconnect: true
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/variables.scss" as *;'
        },
        sass: {
          quietDeps: true,
          silenceDeprecations: ['import']
        }
      }
    },
    plugins: [
      // Plugin personalizado para configurar o Sass
      {
        name: 'sass-config',
        config(config: any) {
          if (!config.css) config.css = {}
          if (!config.css.preprocessorOptions) config.css.preprocessorOptions = {}
          if (!config.css.preprocessorOptions.sass) config.css.preprocessorOptions.sass = {}

          config.css.preprocessorOptions.sass = {
            ...config.css.preprocessorOptions.sass,
            quietDeps: true,
            silenceDeprecations: ['import']
          }

          return config
        }
      }
    ]
  },
  // Configuração de compatibilidade
  nitro: {
    compatibilityDate: '2025-08-14'
  }
})
