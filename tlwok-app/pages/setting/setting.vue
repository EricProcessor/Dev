<template>
	<view>
		<view class="settingList"  v-for="(items,i) in settingList" :key="i">
			<view>
				<i class="tlwok-icon" :class="items.icon"></i>
				<span>{{items.title}}</span>
			</view>
			<view>
				<i class="tlwok-icon tlwicon-right"></i>
			</view>
		</view>
		<view class="btnCon">
			<view class="signOut" @tap="signOut">退出登录</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				settingList:[{
					title:'账户管理',
					icon:'tlwicon-zhanghu'
				},{
					title:'账户绑定',
					icon:'tlwicon-bangding'
				},{
					title:'意见反馈',
					icon:'tlwicon-yijianfankui1'
				},{
					title:'关于',
					icon:'tlwicon-info'
				}]
			};
		},
		methods:{
			signOut:function (){
				console.log('退出登录')
			}
		}
	}
</script>

<style scoped lang="scss">
	.settingList{
		background: #fff;
		display: flex;
		justify-content: space-between;
		margin-bottom: 2upx;
		color: #666;
		box-sizing: border-box;
		i,span{
			display: inline-block;
			height: 80upx;
			line-height: 80upx;
		}
		i{
			padding: 0 20upx;
			font-size: 40upx;
		}
	}
	.btnCon{
		width: 100%;
		color: #fff;
		text-align: center;
		position: fixed;
		bottom: 10upx;
		.signOut{
			width: 500upx;
			height: 80upx;
			line-height: 80upx;
			background: #e4393c;
			margin: 0 auto;
			border-radius: 50upx;
			i{
				display: inline-block;
			}
		}
	}
</style>
