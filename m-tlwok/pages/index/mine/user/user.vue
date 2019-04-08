<template>
	<view class="user">
		<view class="userPhoto">
			<image src="/static/image/user.png" mode=""></image>
		</view>
		<view class="userBtn">
			<span @tap="routerTo($event)" data-type="login">登 录</span>
			<span @tap="routerTo($event)" data-type="register">注 册</span>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				routerType:{
					'login': '/pages/login/login',
					'register': '/pages/register/register'
				}
			};
		},
		methods:{
			routerTo:function (e){
				let type = e.currentTarget.dataset.type;
				uni.navigateTo({
					url: this.routerType[type],
					animationType: 'pop-in',
					animationDuration: 200
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.user{
		height: 280upx;
		background: url(../../../../static/image/bg-user.png) no-repeat;
		background-size: cover;
		text-align: center;
		border-bottom: 2upx solid #e2e7e9;
		box-sizing: border-box;
		.userPhoto{
			text-align: center;
			image{
				width: 100upx;
				height: 100upx;
				margin: 0 auto;
				border-radius: 50%;
				margin-top: 50upx;
			}
			
		}
		.userBtn{
			text-align: center;
			span{
				display: inline-block;
				width: 200upx;
				height: 60upx;
				line-height: 60upx;
				margin: 20upx 10upx;
				background: none;
				font-size: 24upx;
				border:2upx solid #fff;
				box-sizing: border-box;
				color: #fff;
				border-radius: 6upx;
			}
		}
	}
		
</style>
