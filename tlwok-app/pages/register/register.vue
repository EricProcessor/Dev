<template>
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
</template>

<script>
	export default {
		data() {
			return {
				
			};
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
	@import '@/common/css/pages/register.scss'
</style>
