<template>
	<view class="mine">
		<view class="topCon">
			<view class="settings">	
				<a href="" @tap="changeRole()">切换为卖家</a>
				<text @tap="settings()" class="tlwok-icon">&#xe68a;</text>
			</view>
			<view class="userHead">
				<image src="../../../static/image/head.jpg" mode=""></image>
				<text>usdh17712xqwqwxx</text>
			</view>
		</view>
		<view class="orderInfo">
			<view class="details">
				<text class="tlwok-icon">&#xe6ee;</text>
				<text>待付款</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe671;</text>
				<text>待收货</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe667;</text>
				<text>待评价</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe6ed;</text>
				<text>售后/退款</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe74a;</text>
				<text>我的订单</text>
			</view>
		</view>
		<view class="myFun">
			<view class="details">
				<text class="tlwok-icon">&#xe7ec;</text>
				<text>收藏夹</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe69d;</text>
				<text>浏览历史</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe666;</text>
				<text>我的消息</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe667;</text>
				<text>优惠券</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe651;</text>
				<text>收货地址</text>
			</view>
			<view class="details">
				<text class="tlwok-icon">&#xe6ac;</text>
				<text>金融服务</text>
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
	.orderInfo{
		width: 100%;
		height: 124upx;
		background-color: #ffffff;
		margin-top: 20upx;
		margin-bottom: 20upx;
		display: flex;
		justify-content: center;
		align-items: center;
		.details{
			display: flex;
			flex-direction: column;
			flex: 1;
			// justify-content: center;
			align-items: center;
			.tlwok-icon{
				font-size: 48upx;
			}
			text{
				font-size: 26upx;
			}
		}
	}
	.myFun{
		width: 100%;
		height: 600upx;
		background-color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		.details{
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 33%;
			.tlwok-icon{
				font-size: 80upx;
			}
			text{
				font-size: 26upx;
			}
		}
	}
}	
</style>
