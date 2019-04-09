<template>
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
</template>

<script>
	export default {
		data() {
			return {
				
			};
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
	@import '@/static/css/pages/login.scss'
</style>
