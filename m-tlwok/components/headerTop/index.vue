<template>
	<view class="m-header">
		<view class="m-back" v-if="showBack" @tap="goBack"></view>
		<h3>{{ mTitle }}</h3>
	</view>
</template>

<script>
	export default{
		props: {
			mTitle: {
			  type: String,
			  required: true
			},
			showBack: {
			  type: Boolean,
			  required: true
			}
		},
		methods:{
			goBack: function (){
				uni.navigateBack({
					delta: 0,
					animationType: 'pop-out',
					animationDuration: 200
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.m-header{
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 90upx;
		line-height: 90upx;
		border-bottom: 2upx solid #e2e7e9;
		text-align: center;
		background: #fdfbfb;
		box-sizing: border-box;
		z-index: 9999;
		h3{
			font-size: 32upx;
			color: #1a1a1a;
			font-weight: normal;
		}
		.m-back{
			display: block;
			width: 40upx;
			height: 40upx;
			position: absolute;
			top: 30upx;
			left: 30upx;
			background: url(../../static/image/sprites.png) no-repeat;
			background-size: 175px auto;
			background-position: -150px -100px;
		}
	}
</style>
