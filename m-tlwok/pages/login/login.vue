<template>
	<view>
		<mHeader :mTitle="mTitle" :showBack="showBack"></mHeader>
		<view class="Content">
			<view class="loginForm">
				<view class="loginItem">
					<input type="text" value="" placeholder="用户名/手机号"/>
				</view>
				<view class="loginItem">
					<input type="text" value="" placeholder="请输入密码"/>
				</view>
				<view class="loginItem forgetPwd">
					<a href="">忘记密码？</a>
				</view>
				<view class="loginItem">
					<button type="primary">登录</button>
				</view>
			</view>
			<view class="otherLogin">
				<span>其他方式登录</span>
			</view>
			<view class="wxLogin">
				<i></i>
			</view>
			<view class="toRegister">
				还没有账号？<span @tap="toRegister">立即注册→</span>
			</view>
		</view>
	</view>
</template>

<script>
	import mHeader from '@/components/headerTop/index.vue'
	export default {
		data() {
			return {
				mTitle:'登录',
				showBack: true
			};
		},
		components:{
			mHeader
		},
		methods:{
			toRegister:function (){
				uni.navigateTo({
					url: '/pages/register/register',
					animationType: 'pop-in',
					animationDuration: 200
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.Content{
		padding: 90upx 80upx 100upx 80upx;
		.loginForm{
			width: 100%;
			margin-top: 100upx;
			.loginItem{
				font-family: 'microsoft yahei';
				font-size: 28upx;
				margin-bottom: 50upx;
				input{
					width: 100%;
					height: 90upx;
					line-height: 90upx;
					background-color: #F3F3F3;
					border: none;
					border-radius: 10upx;
					padding-left: 20upx;
				}
				button{
					display: block;
					height: 90upx;
					line-height: 90upx;
					background: #e4393c;
					color: #fff;
					border-radius: 6upx;
					font-size: 30upx;
					text-align: center;
					box-sizing: border-box;
				}
			}
			.forgetPwd{
				text-align: center;
				a{
					font-size: 24upx;
					color: #f5686a;
					cursor: pointer;
				}
			}
		}
		.otherLogin{
			margin: 100upx 0;
			position: relative;
			text-align: center;
			span{
				font-size: 24upx;
				color: #8e8e93;
				padding: 0 20upx;
			}
		}
		.wxLogin{
			text-align: center;
			i{
				display: inline-block;
				width: 96upx;
				height: 96upx;
				background: url(../../static/image/wx-icon.png) no-repeat;
				background-size: 100% auto;
			}
		}
		.toRegister{
			margin-top: 40upx;
			text-align: center;
			font-size: 24upx;
			color: #828282;
			span{
				color: #f5686a
			}
		}
	}
</style>
