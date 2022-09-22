import 'element-plus/theme-chalk/el-message.css' // 导入 ElMessage 组件的样式
import '@/assets/fonts/iconfont.css'
import '@/assets/css/global.scss'
import { createApp } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import App from '@/App.vue'
import router from '@/router'

axios.defaults.baseURL = 'http://localhost:8888/api/private/v1'

const vue = createApp(App)

vue.config.globalProperties.$message = ElMessage
vue.config.globalProperties.$http = axios

vue.use(router).mount('#app')
