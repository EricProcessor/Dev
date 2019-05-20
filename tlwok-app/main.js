import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
//配置公共接口api前缀
console.log(uni.getSystemInfoSync())
let system = uni.getSystemInfoSync().platform
if(system == "ios" || system == "android"){
	Vue.prototype.$apiUrl = "http://m-new-dev.tlwok.com";
}else{
	Vue.prototype.$apiUrl = "/api";
}

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
