import Vue from 'vue'
import Router from 'vue-router'
import Search from '@/components/Search'
import SearchResult from '@/components/SearchResult'
import DownloadPage from '@/components/DownloadPage'

Vue.use(Router)

export default new Router({
  routes: [
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
})
