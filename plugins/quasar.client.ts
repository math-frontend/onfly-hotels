import { Quasar, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Importar CSS do Quasar de forma mais específica para evitar avisos
import 'quasar/src/css/index.sass'

export default defineNuxtPlugin(() => {
  const app = getCurrentInstance()

  if (app) {
    app.appContext.app.use(Quasar, {
      config: {
        brand: {
          primary: '#009EFB',
          secondary: '#007DC7',
          success: '#00835C',
          info: '#ADADB3',
          warning: '#FF9800',
          negative: '#F44336'
        },
        // Configurações adicionais para melhor performance
        dark: false,
        notify: {
          position: 'top-right',
          timeout: 3000
        }
      },
      plugins: {
        Notify,
        Dialog
      },
      components: {
        QLayout: true,
        QPageContainer: true,
        QDrawer: true,
        QBtn: true,
        QSpinner: true
      }
    })
  }
})
