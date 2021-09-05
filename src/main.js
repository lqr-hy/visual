import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import * as echarts from 'echarts'
import axios from 'axios'
import '@/assets/css/global.less'
import './assets/font/iconfont.css'

import SocketService from './service/socker_service'
SocketService.Instance.connect()

axios.defaults.baseURL = 'http://127.0.0.1:3333/api/'

const app = createApp(App)

app.config.globalProperties.$echarts = echarts
app.config.globalProperties.$http = axios
app.config.globalProperties.$socket = SocketService.Instance

app.use(store).use(router).mount('#app')
