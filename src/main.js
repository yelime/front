import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
Vue.prototype.$baseUrl = 'http://yelime.pe.kr:8989/api/product'
Vue.prototype.$imgUrl = 'http://yelime.pe.kr/emart/dbimg/'

new Vue({
  router,
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
