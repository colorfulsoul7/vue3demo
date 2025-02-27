import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'virtual:windi.css'
import './assets/style/reset.scss'
import store from '@/stores'

import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

app.use(createPinia())
app.use(store)
app.use(router)

app.mount('#app')
