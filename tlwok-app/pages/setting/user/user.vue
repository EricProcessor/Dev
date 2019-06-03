<template>
  <view class="userBox">
    <view class="headTop">
      <image src="/static/image/head.jpg"></image>
    </view>
    <view class="btnList" v-for="(item,i) in userAbout" :key="i" @tap="changeSth(item.url)">
      <view class="nameAbout">
        <view class="title">{{item.title}}</view>
        <view class="explain">{{item.explain}}</view>
      </view>
      <view>
        <i class="tlwok-icon tlwicon-right"></i>
      </view>
    </view>
  </view>
</template>

<script>
	export default {
		data() {
			return {
				userAbout:[{
          title: '密码修改',
          icon: 'tlwicon-zhanghu',
          explain:'*建议您定期更改密码以保护账户安全',
          url: '/pages/setting/user/updatePwd'
        },{
          title: '修改手机',
          icon: 'tlwicon-zhanghu',
          explain:'*若您的验证手机已丢失或停用，请立即修改更换',
          url: '/pages/setting/user/updateTel'
        },{
          title: '修改支付密码',
          icon: 'tlwicon-zhanghu',
          explain:'*建议您设置更高强度的支付密码',
          url: '/pages/setting/user/updatePay'
        }]
			}
    },
    methods:{
      changeSth(url){
        uni.navigateTo({
          url: url,
          animationType: 'pop-in',
          animationDuration: 200
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
.userBox{
  .headTop{
    width: 100%;
    height: 280upx;
    background: url('/static/image/bg-shop.png') no-repeat center center ;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20upx;
    image{
      width: 108upx;
      height: 108upx;
      border-radius: 50%;
    }
  }
  .btnList{
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2upx;
    color: #666;
    box-sizing: border-box;
    height: 120upx;
    padding:0 20upx;
    .nameAbout{
      .title{
        font-size: 28upx;
        color: #1a1a1a;
      }
      .explain{
        font-size: 24upx;
        color: #bfbfbf;
      }
    }
  }
}
</style>
