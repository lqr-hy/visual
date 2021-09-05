import { createRouter, createWebHistory } from 'vue-router'
import SellerPage from '@/views/SellerPage'
import TrendPage from '@/views/TrendPage'
import MapPage from '@/views/MapPage'
import RankPage from '@/views/RankPage'
import HotPage from '@/views/HotPage'
import StockPage from '@/views/StockPage'
import Home from '@/views/Home'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/sellerPage',
    name: 'SellerPage',
    component: SellerPage
  },
  {
    path: '/trendPage',
    name: 'TrendPage',
    component: TrendPage
  },
  {
    path: '/mapPage',
    name: 'MapPage',
    component: MapPage
  },
  {
    path: '/rankPage',
    name: 'RankPage',
    component: RankPage
  },
  {
    path: '/hotPage',
    name: 'HotPage',
    component: HotPage
  },
  {
    path: '/stockPage',
    name: 'StockPage',
    component: StockPage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
