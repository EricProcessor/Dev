<template>
  <view class="searchBox">
    <!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view> 
    <view class="content">
       <view class="topBar">
          <view class="left" @tap="back"><i class="tlwok-icon tlwicon-back"></i></view>
          <view class="input-view">
            <view class="list"  @tap="selectElse">
              <view class="name">
                <view class="pro">产品</view>
                <view class="vendor">供销商</view>
              </view>
              <view class="downIcon tlwok-icon tlwicon-unfold"></view>
            </view>
            <input confirm-type="search" @confirm="confirm" class="input" type="text" placeholder="输入搜索关键词" />
            <uni-icon type="search" size="22" color="#666666"></uni-icon>
          </view>
          <view class="right"><i class="tlwok-icon tlwicon-more_light"></i></view>
       </view>
    </view> 
  </view>
</template>
<script>
import uniIcon from '@/components/uni-icon/uni-icon.vue'
export default {
  data(){
    return {}
  },
  methods:{
    back(){
      uni.navigateBack({
					delta: 1
			})
    },
    selectElse(){
      console.log(123)
    }
  },
  components: {
			uniIcon
	}
}
</script>
<style lang="scss" scoped>
  view {
		font-size: 28upx;
		line-height: inherit
	}
.content{
  .topBar{
    display: flex;
    background: #fff;
    .left,.right{
      display: flex;
      width: 88upx;
      justify-content: center;
      align-items: center;
    }
    .input-view {
      width: 76%;
      display: flex;
      background-color: #e7e7e7;
      height: 30px;
      border-radius: 15px;
      padding: 0 2%;
      flex-wrap: nowrap;
      margin: 7px 0;
      line-height: 30px;
      .uni-icon {
        line-height: 30px !important;
      }
      .input {
        height: 30px;
        line-height: 30px;
        width: 94%;
        padding: 0 3%;
      }
      .list{
        display: flex;
        width: 200upx;
        text-align: center;
        .name{
          height: auto;
          overflow: hidden;
          color: #333;
        }
      }
    }
  }
}
</style>
