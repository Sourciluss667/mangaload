import Vue from 'vue'
import VueRouter from 'vue-router'
import Search from '@/components/Search'
import SearchResult from '@/components/SearchResult'
import DownloadPage from '@/components/DownloadPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Search',
    component: Search
  },
  {
    path: '/search/:name',
    name: 'searchResult',
    component: SearchResult
  },
  {
    path: '/download/:name/:displayName',
    name: 'downloadPage',
    component: DownloadPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
