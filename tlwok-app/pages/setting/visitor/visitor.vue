<template>
  <view class="vistorBox">
    <view class="info">请您描述使用时要反馈的问题</view>
    <textarea
      class="inputInfo"
      v-model="submitInfo.infoVal"
      placeholder="如果您在使用产品时，有什么好或者不好的地方，请大声说出来！我们会关注您的反馈，不断优化产品，为您提供更好的服务！"
    ></textarea>
    <view class="userInfo">
      <view class="userList">
        <view class="title">姓名</view>
        <view class="name">
          <input type="text" v-model="submitInfo.userName" placeholder="请输入姓名">
        </view>
      </view>
      <view class="userList">
        <view class="title">手机</view>
        <view class="name">
          <input type="text" v-model="submitInfo.phone" placeholder="选填">
        </view>
      </view>
    </view>
    <view class="submitBtn" @tap="submitBtn">提交</view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      submitInfo: {
        infoVal: '',
        userName: '',
        phone: ''
      }
    }
  },
  methods: {
    submitBtn () {
      if (this.submitInfo.infoVal == '') {
        uni.showToast({
          title: '反馈内容不能为空',
          duration: 2000
        });
      } else if (this.submitInfo.userName == '') {
        uni.showToast({
          title: '姓名不能为空',
          duration: 2000
        });
      } else if (this.submitInfo.userName != '' && this.submitInfo.infoVal != '') {
        console.log(this.submitInfo)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.vistorBox {
  padding: 0 20upx;
  .info {
    padding: 20upx 0;
    font-size: 28upx;
    color: #666;
  }
  .inputInfo {
    width: 100%;
    height: 160upx;
    border: 1px solid #e2e7e9;
    border-radius: 8upx;
    background: #fff;
    font-size: 24upx;
    padding: 10upx;
    box-sizing: border-box;
  }
  .userList {
    margin-top: 30upx;
    .title {
      font-size: 28upx;
      color: #666;
      padding-bottom: 10upx;
    }
    input {
      background: #fff;
      border-radius: 8upx;
      border: 1px solid #e2e7e9;
      padding: 10upx;
    }
  }
  .submitBtn {
    text-align: center;
    font-size: 28upx;
    color: #fff;
    background: #eb5d5f;
    border-radius: 8upx;
    padding: 20upx 0;
    margin-top: 60upx;
  }
}
</style>

