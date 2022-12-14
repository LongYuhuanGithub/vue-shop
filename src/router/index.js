import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 进度条样式
import LoginView from '@/views/LoginView'
import HomeView from '@/views/HomeView'
import WelcomeView from '@/views/WelcomeView'
import UsersView from '@/views/user/UsersView'
import RolesView from '@/views/permission/RolesView'
import RightsView from '@/views/permission/RightsView'
import CategoriesView from '@/views/goods/CategoriesView'
import ParamsView from '@/views/goods/ParamsView'
import GoodsView from '@/views/goods/GoodsView'
import GoodsAddView from '@/views/goods/GoodsAddView'
import OrdersView from '@/views/order/OrdersView'
import ReportsView from '@/views/report/ReportsView'

NProgress.configure({ showSpinner: false }) // 显示右上角螺旋加载提示

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
      },
      {
        path: 'params',
        component: ParamsView
      },
      {
        path: 'goods',
        component: GoodsView
      },
      {
        path: 'goodsadd',
        component: GoodsAddView
      },
      {
        path: 'orders',
        component: OrdersView
      },
      {
        path: 'reports',
        component: ReportsView
      }
    ]
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404'
  },
  {
    path: '/404',
    component: () => import('@/views/404View.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫，必须要登录才能访问 /login 之外的路由
router.beforeEach((to, from, next) => {
  NProgress.start() // 开始进度条
  if (to.path === '/login') return next() // 访问的是登录页面，放行
  if (!sessionStorage.getItem('vue_shop_token')) return next('/login') // 没有登录，跳转到登录页面
  next()
})

// 路由后置守卫
router.afterEach(() => NProgress.done()) // 结束进度条

export default router
