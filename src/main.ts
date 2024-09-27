import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.component('qrcode-stream', QrcodeStream)
app.use(pinia)
app.mount('#app')
