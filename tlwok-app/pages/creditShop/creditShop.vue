<template>
	<view class="creditShop">
		<view class="shopList">
      <view class="itemTop">
        <view class="shopTitle">
          <view class="title">
            <view class="shopIcon tlwok-icon tlwicon-shop"></view>
            <span>天章香洲店</span>
          </view>
          <view class="rtIcon tlwok-icon tlwicon-right"></view>
        </view>
        <view class="repayMoney">
          <view class="txt">近七日还款金额（元）</view>
          <view class="money">9432.24</view>
        </view>
      </view>
      <view class="itemBottom">
        <span class="left"></span><span class="right"></span>
        <view class="item period">
          <view class="color">月结10天</view>
          <view class="txt">还款账期</view>
        </view>
        <view class="item credit">
          <view class="color">97003.34</view>
          <view class="txt">可用额度</view>
        </view>
        <view class="item quota">
          <view class="color">100000.00</view>
          <view class="txt">授信额度</view>
        </view>
      </view>
    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
    },
    onNavigationBarButtonTap(e){
      console.log(e)
      // uni.navigateTo({
      //   url: '/pages/creditShop/creditShop',
      //   animationType: 'pop-in',
      //   animationDuration: 200
      // })
    },
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>
.creditShop{
  padding: 10px;
  .itemTop{
    padding: 0 10px;
    background-color: #508cee;
    border-radius: 5px 5px 0 0;
    .shopTitle{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16upx 0;
      border-bottom: 1px solid #6a9df1;
      .title{
        display: flex;
        font-size: 28upx;
        color: #fff;
        span{
          padding-left: 10upx;
        }
      }
      .rtIcon{
        font-size:32upx;
        color:#fff;
      }
    }
    .repayMoney{
      padding: 40upx 0;
      color:#fff;
      text-align: center;
      .txt{
        font-size: 24upx;
      }
      .money{
        font-size: 52upx;
        padding-top: 10px;
      }
    }
  }
  .itemBottom{
    padding: 20upx 0;
    background: #fff;
    display: flex;
    align-items: center;
    border-radius: 0 0 10upx 10upx;
    position: relative;
    .left,.right{
      display: block;
      width: 30upx;
      height: 30upx;
      background: #f5f5f5;
      border-radius: 50%;
      position: absolute;
      top:-16upx;
    }
    .left{
      left: -16upx;
    }
    .right{
      right: -16upx;
    }
    .item{
      flex:1;
      text-align: center;
      border-right: 1px solid #bbb;
      .color{
        color: #e4393c;
        font-size: 32upx;
        padding: 10upx 0;
      }
      .txt{
        font-size: 24upx;
        color: #1a1a1a;
      }
    }
    .quota{
      border: none;
    }
  }
}
</style>

