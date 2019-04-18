<template>
	<view class="orderItem">
		<view class="topTitle">
			<view class="item">
				<text>{{ options.shopname }}</text>
				<text class="tlwok-icon tlwicon-right"></text>
			</view>
			<view class="item">
				<text class="tlwok-icon tlwicon-delete"></text>
			</view>
		</view>
		<view class="productitem">
			<image :src="options.imageurl" mode=""></image>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			options: {
				type: Object,
				default: function(e) {
					return {}
				}
			}
		},
		methods:{
			
		}
	}
</script>

<style lang="scss" scoped>
	.orderItem{
		display: flex;
		flex-direction: column;
		background-color: #fff;
		margin-top : 20upx;
		padding: 15upx 25upx;
		font-weight: bold;
		.topTitle{
			display: flex;
			justify-content: space-between;
			width: 100%;
			.item{
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.productitem{
			width: 100%;
			display: flex;
			image{
				width: 200upx;
				height: 200upx;
			}
		}
	}
</style>
