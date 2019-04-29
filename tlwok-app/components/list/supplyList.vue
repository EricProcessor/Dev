<template>
	<view class="item" @tap="toShop(options.shopId)">
		<view class="left">
			<image :src="options.shopLogo" mode=""></image>
		</view>
		<view class="right">
			<view class="shopName">{{options.shopName}}</view>
			<view class="introduce">{{options.introduce}}</view>
			<view class="">
				<uni-rate :disabled="true" :size="16" :value="options.shopLevel"></uni-rate>
			</view>
			<view class="">商品数量:{{options.shopCount}}件</view>
			<view class="">{{options.businessTime}}</view>
		</view>
	</view>
</template>

<script>
	import uniRate from '@/components/uni-rate/uni-rate.vue'
	export default{
		components:{
			uniRate
		},
		props:{
			options: {
				type: Object,
				default: function(e) {
					return {}
				}
			}
		},
		methods:{
			toShop:function (shopId){
				uni.navigateTo({
					url: "/pages/shop/shop?shopId="+shopId,
					animationType: 'pop-in',
					animationDuration: 200
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.item{
		margin: 20upx 0;
		padding: 0 20upx;
		height: 300upx;
		background: #fff;
		display: flex;
		justify-content: space-between;
		.left{
			image{
				width: 200upx;
				height: 200upx;
				margin-top: 50upx;
			}
		}
		.right{
			color: #999;
			padding:20upx 10upx;
			view{
				margin-bottom: 5upx;
			}
			.shopName{
				color: #1e1e1e;
			}
			.introduce{
				line-height: 36upx;
				font-size: 28upx;
				-webkit-line-clamp: 2;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				overflow: hidden;
				font-weight: normal;
				text-overflow: ellipsis;
				-webkit-line-clamp: 2;
			}
		}
	}
</style>
