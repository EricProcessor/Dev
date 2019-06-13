<template>
  <view class="productBox">
    <view class="picture">
      <view class="swiper">
				<view class="swiper-box">
					<swiper circular="true">
						<swiper-item>
              <image src="http://img-b2b.jcloudcs.com/0b5dce3c-853f-4e9f-8e72-a793da527167.jpg?img/sh/640"></image>
						</swiper-item>
            	<swiper-item>
							<image src="http://img-b2b.jcloudcs.com/09366bba-cd66-498d-841c-d5349ab0c270.jpg?img/sh/640"></image>
						</swiper-item>
            	<swiper-item>
							<image src="http://img-b2b.jcloudcs.com/85a4fdf0-693f-47c6-b55e-ce229e7d08eb.jpg?img/sh/640" ></image>
						</swiper-item>
					</swiper>
				</view>
			</view>
    </view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      proInfo: {
        itemId: '',//商品id
        areaId: '',//地区id
        sellerId: '',//卖家id
        shopId: '',//店铺id
        skuId: '',//skuid 
      }
    }
  },
  onLoad (msg) {
    this.proInfo.itemId = msg.pid
  },
  onReady () { },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.swiper {
  width: 100%;
  display: flex;
  justify-content: center;
  .swiper-box {
    width: 100%;
    height: 320upx;
    overflow: hidden;
    //兼容ios，微信小程序
    position: relative;
    z-index: 1;
    swiper {
      width: 100%;
      height: 540upx;
      swiper-item {
        image {
          width: 100%;
          height: 100%;
        }
      }
    }
    .indicator {
      position: absolute;
      bottom: 20upx;
      left: 50%;
      width: 200upx;
      height: 20upx;
      margin-left: -100upx;
      border-radius: 3upx;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      .dots {
        width: 10upx;
        height: 10upx;
        border-radius: 50%;
        margin: 0 6upx;
        background-color: rgba(255, 255, 255, .4);
        &.on {
          background-color: rgba(0, 0, 0, 1);
        }
      }
    }
  }
}
</style>

