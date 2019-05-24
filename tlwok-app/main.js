import Vue from 'vue'
import App from './App'
import config from './utils/config.js'

Vue.config.productionTip = false
//配置公共接口api前缀
Vue.prototype.$apiUrl = config.httpApi


App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
