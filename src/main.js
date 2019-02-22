// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import HttpServer from '@/components/common/http.js'
import ELEMENT from 'element-ui'
import moment from 'moment'
import '@/assets/css/base.css'
// import 'element-ui/lib/theme-chalk/index.css'
import CusBread from '@/components/common/cusBread.vue'


Vue.use(ELEMENT)
Vue.use(HttpServer)

Vue.config.productionTip = false

/* eslint-disable no-new */
Vue.filter('fmtdate', function (v) {
  return moment(v).format('YYYY-MM-DD')
})
Vue.component(CusBread.name, CusBread)
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
