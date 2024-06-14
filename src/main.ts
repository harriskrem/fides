import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { QrcodeStream } from 'vue-qrcode-reader'

const app = createApp(App)

app.use(router)
app.component('qrcode-stream', QrcodeStream)

app.mount('#app')
