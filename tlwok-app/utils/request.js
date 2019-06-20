import config from './config.js'
const tlwok_token = uni.getStorageSync('tlwok_token')
async function get(url, data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: config.httpApi + url,
      data: data,
      method: 'get',
      header: {
        "content-type": 'application/x-www-form-urlencoded',
        "token": tlwok_token
      },
      success: function (data) {
        if (data.msg == 'nndn') {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
        resolve(data)
      },
      fail: function () {
        if (typeof reject == 'function') {
          reject(data);
        } else {
          console.log(data);
        }
        uni.navigateTo({
          url: '/pages/login/login'
        })
      }
    })
  })
}
async function post(url, data) {
  return new Promise(function (resolve, reject) {
    uni.request({
      url: config.httpApi + url,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded',
        "token": tlwok_token
      },
      data,
      success: function (data) {

        if (data.msg == 'nndn') {
          uni.navigateTo({
            url: '/pages/login/login'
          })
        }
        resolve(data)
      },
      fail: function () {
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

export function getIndexFloor() {
  return get('/indexfloor', {})
}
// 获得所有供货商
export function getShopsList(supply) {
  return get('/sec/shop', supply)
}
// 登录
export function loginUser(userInfo) {
  return post('/auth/login', userInfo)
}
// 我的收藏 数量
export function getFavoriteCount() {
  return get('/fav/getFavCount', {})
}
// 我的收藏 商品
export function getFavoritePro(favInfo) {
  return get('/fav/getItemFav', favInfo)
}
// 我的收藏 店铺
export function getFavoriteShop(favInfo) {
  return get('/fav/getShopFav', favInfo)
}
// 获得浏览记录 清空记录
export function getHistoryList(info) {
  return get('/visittrack/getlist', info)
}
export function removeAllHistory() {
  return get('/visittrack/remove', {})
}
// 金融服务
export function getFinanceList(info) {
  return get('/credit/queryCreditList', info)
}
// 我的消息-买家
export function getBuyerMess(msg) {
  return get('/u/get_msg_list', msg)
}

// 我的地址列表
export function getAddress() {
  return get('/add/getList', {})
}
// 获得默认地址
export function getFromAddr(){
  return get('/add/getAddFromRedis',{})
}
// 根据地址判断是否在配送范围内
export function isScoped(info){
  return get('/shop/inShopFareRange',info)
}
// 我的优惠券
export function getCouponList() {
  return get('/coupon/getCouponUseList', {})
}
// 我的订单
export function getOrderList(info) {
  return post('/getOrderList',info)
}

// 商品详情
export function getProductItem (id){
  return get('/pro/getInfo',{itemId:id})
}
// 商品销量
export function getSales(id){
  return post('/pro/getSaleNum',{itemId:id})
}
// 获得sku信息
export function getSkuInfo(sku){
  return post('/pro/getSkuDetail',sku)
}