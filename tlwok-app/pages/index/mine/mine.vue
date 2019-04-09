<template>
	<view class="mine">
		<view class="topCon">
			<view class="settings">	
				<a href="" @tap="changeRole()">切换为卖家</a>
				<text @tap="settings()" class="tlwok-icon">&#xe68a;</text>
			</view>
			<view class="userHead">
				<image src="../../../static/image/head.jpg" mode=""></image>
				<text>usdh17712xxx</text>
			</view>
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
			changeRole(){//触发切换角色
				console.log("切换角色");
			},
			settings(){
				console.log("触发设置按钮")
			}
		}
	}
</script>

<style lang="scss">
page{
	background-color: #f5f5f5;
}
.mine{
	.topCon{
		width: 100%;
		height: 280upx;
		 background-image: linear-gradient(45deg, #ffb516, #ff4545);
		 .settings{
			 display: flex;
			 justify-content: space-between;
			 a{
				margin: 20upx;
				font-size: 20upx;
				color: #fff;
				background: rgba(0,0,0,.2);
				border-radius: 24upx;
				text-decoration: none;
				padding: 14upx;
			 }
			 text{
				 color: #ffffff;
				 padding: 20upx;
				 font-size: 40upx;
			 }
		 }
		 .userHead{
			 display: flex;
			 flex-direction: column;
			 justify-content: center;
			 align-items: center;
			 image{
				 width: 100upx;
				 height: 100upx;
				 border-radius: 50%;
			 }
			 text{
				 color: #ffffff;
				 font-size: 30upx;
			 }
		 }
	}
}	
</style>
