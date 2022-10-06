import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/LoginView'
import HomeView from '@/views/HomeView'
import WelcomeView from '@/views/WelcomeView'
import UsersView from '@/views/UsersView'
import RolesView from '@/views/RolesView'
import RightsView from '@/views/RightsView'
import CategoriesView from '@/views/CategoriesView'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/home',
    component: HomeView,
    redirect: '/home/welcome',
    children: [
      {
        path: 'welcome',
        component: WelcomeView
      },
      {
        path: 'users',
        component: UsersView
      },
      {
        path: 'roles',
        component: RolesView
      },
      {
        path: 'rights',
        component: RightsView
      },
      {
        path: 'categories',
        component: CategoriesView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫，必须要登录才能访问 /login 之外的路由
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next() // 访问的是登录页面，放行
  if (!sessionStorage.getItem('vue_shop_token')) return next('/login') // 没有登录，跳转到登录页面
  next()
})

export default router
