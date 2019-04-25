import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
//配置公共接口api前缀
Vue.prototype.apiUrl = "https://www.tlwok.com/api/";
App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
