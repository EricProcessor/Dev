import config from './config.js'
async function get(url,data){
	return new Promise((resolve,reject)=>{
		uni.request({
			url:config.httpApi + url,
			data:data,
			method:'get',
			// header: {
			// 	"content-type": 'application/x-www-form-urlencoded'
			// },
			success:function(result){
				resolve(result)
			},
			fail:function(){
				if (typeof reject == 'function') {
					reject(data);
				} else {
					console.log(data);
				}
			}
		})
	})
}
async function post(url, data) {
	return new Promise(function(resolve, reject) {
		uni.request({
			url: config.host + url,
			method: 'POST',
			header: {
				"content-type": 'application/x-www-form-urlencoded'
			},
			data,
			success: function(data) {
				resolve(data)
			},
			fail: function() {
				// 回调失败时
				if (typeof reject == 'function') {
					reject(data);
				} else {
					console.log(data);
				}
			}
		})
	})
}

export function getIndexFloor(){
	return get('/indexfloor',{}).then(res=>{
		return res
	})
}
// 获得所有供货商
export function getShopsList(supply){
  return get('/sec/shop',{ supply }).then(res =>{
    return res
  })
}