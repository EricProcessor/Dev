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
        "Authorization": tlwok_token
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
  return get('/indexfloor', {}).then(res => {
    return res
  })
}
// 获得所有供货商
export function getShopsList(supply) {
  return get('/sec/shop', supply).then(res => {
    return res
  })
}
// 登录
export function loginUser(userInfo) {
  return post('/auth/login', userInfo).then(res => {
    return res
  })
}
// 我的收藏 数量
export function getFavoriteCount(supply) {
  return get('/fav/getFavCount', supply).then(res => {
    return res
  })
}
// 我的收藏 商品
export function getFavoritePro(favInfo) {
  return get('/fav/getItemFav', favInfo).then(res => {
    return res
  })
}
// 我的收藏 店铺
export function getFavoriteShop(favInfo) {
  return get('/fav/getShopFav', favInfo).then(res => {
    return res
  })
}
// 获得浏览记录 清空记录
export function getHistoryList(info) {
  return get('/visittrack/getlist', info).then(res => {
    return res
  })
}
export function removeAllHistory() {
  return get('/visittrack/remove', {}).then(res => {
    return res
  })
}
// 金融服务
export function getFinanceList(info) {
  return get('/credit/queryCreditList', info).then(res => {
    return res
  })
}
// 我的消息-买家
export function getBuyerMess(msg) {
  return get('/u/get_msg_list', msg).then(res => {
    return res
  })
}

// 我的地址
export function getAddress() {
  return get('/add/getList', {}).then(res => {
    return res
  })
}
// 我的优惠券
export function getCouponList() {
  return get('/coupon/getCouponUseList', {}).then(res => {
    return res
  })
}