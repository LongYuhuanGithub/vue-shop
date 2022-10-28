import '@/assets/fonts/iconfont/iconfont.css'
import '@/assets/fonts/iconfont.css'
import 'element-plus/theme-chalk/el-loading.css' // 导入 ElLoading 组件的样式
import 'element-plus/theme-chalk/el-message.css' // 导入 ElMessage 组件的样式
import 'element-plus/theme-chalk/el-message-box.css' // 导入 ElMessageBox 组件的样式
import 'animate.css' // 导入动画库样式
import '@/assets/css/global.scss'
import { createApp } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'
import moment from 'moment'
import App from '@/App.vue'
import router from '@/router'

axios.defaults.baseURL = 'http://localhost:8888/api/private/v1'
let loadingInstance = null
axios.interceptors.request.use(config => { // 请求拦截
  loadingInstance = ElLoading.service({ fullscreen: true })
  config.headers.Authorization = window.sessionStorage.getItem('vue_shop_token') // 为每次请求挂载 token 字符串
  return config
})
axios.interceptors.response.use(response => { // 响应拦截
  loadingInstance.close()
  return response
})
moment.locale('zh-cn')

const vue = createApp(App)

// 全局挂载
vue.provide('message', ElMessage)
vue.provide('http', axios)
vue.provide('moment', moment)

vue.use(router).mount('#app')
