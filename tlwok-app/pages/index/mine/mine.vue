<template>
	<view class="mine">
		<view class="topCon">
			<view class="settings">	
				<a href="" @tap="changeRole()">切换为卖家</a>
				<text @tap="settings()" class="tlwok-icon">&#xe68a;</text>
			</view>
			<view class="userHead">
				<image src="../../../static/image/head.jpg" mode=""></image>
				<text>usdh17712xqwxx</text>
			</view>
		</view>
		<view class="orderInfo">
			<view class="details" v-for="item in orderInfoData" :key="item.id" @tap="orderSel(item.orderlink)">
				<text :class="item.ordericon"></text>
				<text>{{ item.ordertitle }}</text>
			</view>
		</view>
		<view class="myFun">
			<view class="details" v-for="item in myFunlist" :key="item.id" @tap="orderSel(item.myfunlink)">
				<text :class="item.myfunicon"></text>
				<text>{{item.myfuntitle}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderInfoData:[
						{id:1,ordericon:'tlwok-icon tlwicon-vipcard',ordertitle:'待付款',orderlink:'toPendingpayment'},
						{id:2,ordericon:'tlwok-icon tlwicon-deliver',ordertitle:'待收货',orderlink:'tobereceived'},
						{id:3,ordericon:'tlwok-icon tlwicon-comment',ordertitle:'待评价',orderlink:'tobeevaluated'},
						{id:4,ordericon:'tlwok-icon tlwicon-recharge',ordertitle:'售后/退款',orderlink:'torefund'},
						{id:5,ordericon:'tlwok-icon tlwicon-calendar',ordertitle:'我的订单',orderlink:'tomyorder'}
					],
				myFunlist:[
					{id:1,myfunicon:"tlwok-icon tlwicon-like",myfuntitle:"收藏夹",myfunlink:"/pages/favorite/favorite"},
					{id:2,myfunicon:"tlwok-icon tlwicon-footprint",myfuntitle:"浏览历史",myfunlink:"/pages/history/history"},
					{id:3,myfunicon:"tlwok-icon tlwicon-mark",myfuntitle:"我的消息",myfunlink:"/pages/myNews/myNews"},
					{id:4,myfunicon:"tlwok-icon tlwicon-coupon",myfuntitle:"优惠券",myfunlink:"/pages/coupon/coupon"},
					{id:5,myfunicon:"tlwok-icon tlwicon-location",myfuntitle:"收货地址",myfunlink:"/pages/address/address"},
					{id:6,myfunicon:"tlwok-icon tlwicon-sponsor",myfuntitle:"金融服务",myfunlink:"/pages/finance/finance"},
				]
			};
		},
		methods:{
			changeRole(){//触发切换角色
				console.log("切换角色");
			},
			settings(){
				console.log("触发设置按钮")
			},
			orderSel: function(link){
				console.log("跳转到"+link);
				uni.navigateTo({
					url: link,
					animationType: 'pop-in',
					animationDuration: 200
				});
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
				color: #ffb685;
			}
			text{
				font-size: 26upx;
				
			}
		}
	}
}	
</style>
