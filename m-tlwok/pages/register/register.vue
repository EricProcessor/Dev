<template>
	<view>
		<mHeader :mTitle="mTitle" :showBack="showBack"></mHeader>
		<view class="Content">
			<view class="regHeader">
				<span>免费注册</span>
			</view>
			<view class="regForm">
				<view class="regFormItem">
					<input type="text" value="" placeholder="请输入手机号"/>
				</view>
				<view class="regFormItem">
					<input type="text" value="" placeholder="请输入密码"/>
				</view>
				<view class="regFormItem">
					<input type="text" value="" placeholder="请再次输入密码"/>
				</view>
				<view class="regFormItem">
					<input type="text" value="" placeholder="请输入验证码"/>
				</view>
				<view class="regFormItem">
					<button type="primary">注册</button>
					<view class="Agreement">注册即表示您同意<span>《用户注册协议》</span></view>
				</view>
			</view>
			<view class="toLogin">
				已有账号？<span @tap="toLogin">去登录></span>
			</view>
		</view>
	</view>
</template>

<script>
	import mHeader from '@/components/headerTop/index.vue'
	export default {
		data() {
			return {
				mTitle:'注册',
				showBack: true
			};
		},
		components:{
			mHeader
		},
		methods:{
			toLogin:function (){
				uni.navigateTo({
					url: '/pages/login/login',
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
		.regHeader {
			margin: 100upx 0;
			span{
				font-size: 48upx;
				color: #e4393c;
			}
		}
		.regForm{
			width: 100%;
			.regFormItem{
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
				.Agreement{
					font-size: 24upx;
					color: #333333;
					margin: 20upx 0;
					span{
						color: #3975E4;
					}
				}
			}
		}
		.toLogin{
			margin-top: 40upx;
			text-align: center;
			font-size: 24upx;
			color: #828282;
			span{
				color: #3975E4;
			}
		}
	}
</style>
