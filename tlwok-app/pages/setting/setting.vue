<template>
  <view>
    <view class="settingList" v-for="(items,i) in settingList" :key="i" @tap="signIn(items.url)">
      <view>
        <i class="tlwok-icon" :class="items.icon"></i>
        <span>{{items.title}}</span>
      </view>
      <view>
        <i class="tlwok-icon tlwicon-right"></i>
      </view>
    </view>
    <view class="btnCon">
      <view class="signOut" @tap="signOut">退出登录</view>
    </view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      settingList: [{
        title: '账户管理',
        icon: 'tlwicon-zhanghu',
        url: '/pages/setting/user/user'
      }, {
        title: '账户绑定',
        icon: 'tlwicon-bangding',
        url: ''
      }, {
        title: '意见反馈',
        icon: 'tlwicon-yijianfankui1',
        url: '/pages/setting/visitor/visitor'
      }, {
        title: '关于',
        icon: 'tlwicon-info',
        url: ''
      }]
    };
  },
  methods: {
    signIn (url) {
      uni.navigateTo({
        url: url,
        animationType: 'pop-in',
        animationDuration: 200
      })
    },
    signOut: function () {
      console.log('退出登录')
    }
  }
}
</script>

<style scoped lang="scss">
.settingList {
  background: #fff;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2upx;
  color: #666;
  box-sizing: border-box;
  i,
  span {
    display: inline-block;
    height: 80upx;
    line-height: 80upx;
  }
  i {
    padding: 0 20upx;
    font-size: 40upx;
  }
}
.btnCon {
  width: 100%;
  color: #fff;
  text-align: center;
  position: fixed;
  bottom: 10upx;
  .signOut {
    width:90%;
    height: 80upx;
    line-height: 80upx;
    background: #eb5d5f;
    margin: 0 auto;
    border-radius: 14upx;
    i {
      display: inline-block;
    }
  }
}
</style>
