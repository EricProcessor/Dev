import config from './config.js'
const tlwok_token = uni.getStorageSync('tlwok_token').data
async function get(url,data){
	return new Promise((resolve,reject)=>{
		uni.request({
			url:config.httpApi + url,
			data:data,
			method:'get',
			header: {
        "content-type": 'application/x-www-form-urlencoded',
        "Authorization":tlwok_token
			},
			success:function(data){
        if(data.msg == 'nndn'){
          uni.navigateTo({
            url:'/pages/login/login'
          })
        }
        resolve(data)
			},
			fail:function(){
				if (typeof reject == 'function') {
					reject(data);
				} else {
					console.log(data);
        }
        uni.navigateTo({
          url:'/pages/login/login'
        })
			}
		})
	})
}
async function post(url, data) {
	return new Promise(function(resolve, reject) {
		uni.request({
			url: config.httpApi + url,
			method: 'POST',
			header: {
        "content-type": 'application/x-www-form-urlencoded',
        "Authorization":tlwok_token
			},
			data,
			success: function(data) {
        
        if(data.msg == 'nndn'){
          uni.navigateTo({
            url:'/pages/login/login'
          })
        }
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
  return get('/sec/shop',supply).then(res =>{
    return res
  })
}
// 登录
export function loginUser(userInfo){
  return post('/auth/login',userInfo).then(res =>{
    return res
  })
}