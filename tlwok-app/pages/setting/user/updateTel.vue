<template>
  <view class="changeBox">
    <view class="explain">请完成以下验证</view>
    <view class="phone">请完成 {{phone}} 收到的短信验证码</view>
    <view class="inputView">
      <input type="text" class="inputCode" v-model="inputVal" placeholder="请输入验证码">
      <view class="getCode" v-if="isRepeat" @tap="getCode">获得验证码</view>
      <view class="getCode isGetCoded" v-if="!isRepeat">{{count}}秒后重新获取</view>
    </view>
    <view class="nextTo" @tap="nextTo">下一步</view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      phone: '15110253002',
      inputVal: '',
      timer: null,
      count: '',
      isRepeat: true,
      code: ''
    }
  },
  methods: {
    getCode () {
      const time_count = 59
      if (!this.timer) {
        this.count = time_count
        this.isRepeat = false
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= time_count) {
            this.count--
          } else {
            this.isRepeat = true
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
      }
    },
    nextTo () {
      if (this.inputVal == '') {
        uni.showToast({
          title: '请输入验证码',
          duration: 2000,
          icon: 'none'
        })
      } else if (this.inputVal != this.code) {
        uni.showToast({
          title: '验证码不正确',
          duration: 2000,
          icon: 'none'
        })
      }else{
        console.log('下一步')
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.changeBox {
  padding: 0 20upx;
  .explain {
    font-size: 32upx;
    color: #000;
    padding: 32upx 0;
  }
  .phone {
    font-size: 26upx;
    font-size: #333;
    margin-bottom: 20upx;
  }
  .inputView {
    display: flex;
    align-items: center;
    padding-bottom: 60upx;
    .inputCode {
      width: 420upx;
      height: 60upx;
      border-radius: 6upx;
      border: 1px solid #f5f5f5;
      background: #fff;
      padding: 0 8upx;
      font-size: 28upx;
    }
    .getCode {
      border: 1px solid #eb5d5f;
      padding: 10upx 20upx;
      margin-left: 20upx;
      border-radius: 8upx;
      font-size: 28upx;
      color: #eb5d5f;
      background: #fff;
    }
    .isGetCoded {
      background: #eee;
      border-color: #ccc;
      color: #777;
    }
  }
  .nextTo {
    background: #eb5d5f;
    color: #fff;
    text-align: center;
    padding: 16upx;
    border-radius: 8upx;
  }
}
</style>

