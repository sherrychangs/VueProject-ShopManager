import Vue from 'vue'
import VueRouter from 'vue-router'
import { Message } from 'element-ui'


const Login = () => import('@/components/login.vue')
const Home = () => import('@/components/home.vue')
const Users = () => import('@/components/users/users.vue')
const Rights = () => import('@/components/RightManager/rights.vue')
const Roles = () => import('@/components/RightManager/roles.vue')
const Goods = () => import('@/components/goods/goodsList.vue')
const GoodsAdd = () => import('@/components/goods/goodsAdd.vue')
const Params = () => import('@/components/goods/params.vue')
const Categories = () => import('@/components/goods/categories.vue')
const Orders = () => import('@/components/orders/orders.vue')
const Reports = () => import('@/components/reports/reports.vue')

// import Login from '@/components/login.vue'
// import Home from '@/components/home.vue'
// import Users from '@/components/users/users.vue'
// import Rights from '@/components/RightManager/rights.vue'
// import Roles from '@/components/RightManager/roles.vue'
// import Goods from '@/components/goods/goodsList.vue'
// import GoodsAdd from '@/components/goods/goodsAdd.vue'
// import Params from '@/components/goods/params.vue'
// import Categories from '@/components/goods/categories.vue'
// import Orders from '@/components/orders/orders.vue'
// import Reports from '@/components/reports/reports.vue'


Vue.use(VueRouter)


const router = new VueRouter({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    }, {
      path: '/',
      name: 'home',
      component: Home,
      children: [{
        name: 'users',
        path: '/users',
        component: Users
      }, {
        name: 'rights',
        path: '/rights',
        component: Rights
      }, {
        name: 'roles',
        path: '/roles',
        component: Roles
      }, {
        name: 'goods',
        path: '/goods',
        component: Goods
      }, {
        name: 'goodsAdd',
        path: '/goodsAdd',
        component: GoodsAdd
      }, {
        name: 'params',
        path: '/params',
        component: Params
      }, {
        name: 'categories',
        path: '/categories',
        component: Categories
      }, {
        name: 'orders',
        path: '/orders',
        component: Orders
      }, {
        name: 'reports',
        path: '/reports',
        component: Reports
      }]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'login') {
    next()
  } else {
    const AUTH_TOKEN = localStorage.getItem('token')
    if (!AUTH_TOKEN) {
      Message.warning('请先登录')
      router.push({
        name: 'login'
      })
      return
    }
    next()
  }
})

export default router