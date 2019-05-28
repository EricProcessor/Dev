<template>
  <view class="Content">
    <view class="loginForm">
      <view class="loginItem">
        <input type="text" v-model="userInfo.account" placeholder="用户名/手机号">
        <i class="tlwok-icon tlwicon-people"></i>
      </view>
      <view class="loginItem">
        <input type="password" v-model="userInfo.password" @tap="clearValue" placeholder="请输入密码">
        <i class="tlwok-icon tlwicon-lock"></i>
      </view>
      <view class="loginItem forgetPwd">
        <span @tap="togetPass">忘记密码？</span>
      </view>
      <view class="loginItem" @tap="loginIn">
        <button type="primary">登录</button>
      </view>
    </view>
    <view class="otherLogin" v-if="aouthWx">
      <span>其他方式登录</span>
    </view>
    <view class="wxLogin" @tap="loginWx" v-if="aouthWx">
      <i class="tlwok-icon tlwicon-weixin"></i>
    </view>
    <view class="toRegister">
      还没有账号？
      <span @tap="toRegister">立即注册→</span>
    </view>
  </view>
</template>

<script>
import md5 from "js-md5";
import { loginUser } from "@/utils/request";

export default {
  data() {
    return {
      aouthWx: false,
      userInfo: {
        account: "",
        password: ""
      }
    };
  },
  onLoad: function() {
    // #ifdef APP-PLUS
    this.aouthWx = true;
    // #endif
  },
  methods: {
    async loginIn() {
      this.userInfo.password = md5(this.userInfo.password);
      const res = await loginUser(this.userInfo);
      // console.log(res.data.result.access_token)
      if (res.data.success) {
        uni.setStorageSync("tlwok_token", res.data.result.access_token);
        uni.navigateTo({
					url: '/pages/index/index',
					animationType: 'pop-in',
					animationDuration: 200
				})
      } else {
        uni.showToast({
          title: res.desc,
          duration: 2000,
          icon:'none'
        });
      }
    },
    toRegister: function() {
      uni.navigateTo({
        url: "/pages/register/register",
        animationType: "pop-in",
        animationDuration: 200
      });
    },
    loginWx: function() {
      if (
        plus.runtime.isApplicationExist({
          pname: "com.tencent.mm",
          action: "weixin://"
        })
      ) {
        console.log("微信应用已安装");
      } else {
        console.log("微信应用未安装");
      }
      uni.getProvider({
        service: "oauth",
        success: function(res) {
          console.log(res.provider);

          //支持微信、qq和微博等
          if (~res.provider.indexOf("weixin")) {
            uni.login({
              provider: "weixin",
              scopes: "auth_user",
              success: function(loginRes) {
                console.log("-------获取openid(unionid)-----");
                console.log(JSON.stringify(loginRes));
                // 获取用户信息
                uni.getUserInfo({
                  provider: "weixin",
                  success: function(infoRes) {
                    console.log("-------获取微信用户所有-----");
                    console.log(JSON.stringify(infoRes));
                  }
                });
              },
              fail: function(err) {
                console.log(JSON.stringify(err));
              }
            });
          }
        }
      });
    },
    togetPass: function() {
      uni.navigateTo({
        url: "/pages/getpass/getpass",
        animationType: "pop-in",
        animationDuration: 200
      });
    },
    clearValue() {
      this.userInfo.password = "";
    }
  }
};
</script>

<style scoped lang="scss">
@import "@/common/css/pages/login.scss";
</style>
