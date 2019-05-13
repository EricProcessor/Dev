<template>
	<view class="mine">
		<!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<view style="margin:0 auto;font-size: 32upx;font-weight: 700;">
				个人中心
			</view>
		</view>
		<view class="place"></view>
		<!-- 自定义导航头结束 -->
		<view class="topCon">
			<view class="settings">	
				<a href="" @tap="changeRole">切换为卖家</a>
				<text @tap="settings" class="tlwok-icon">&#xe68a;</text>
			</view>
			<view class="userHead">
				<template v-if="!isLogin">
					<image src="/static/image/head.jpg" mode=""></image>
					<view class="userLogin">
						<view @tap="userTo('login')">登录</view>
						<view @tap="userTo('register')">注册</view>
					</view>
				</template>
				<template v-else>
					<image src="/static/image/head.jpg" mode=""></image>
					<text>{{userName}}</text>
				</template>
			</view>
		</view>
		<view class="orderInfo">
			<view class="allOrder" @tap="orderSel('/pages/order/order?item=0')">
				<view>我买到的货品</view>
				<view>全部订单<i class="tlwok-icon">&#xe6a3</i></view>
			</view>
			<view class="orderOthers">
				<view class="details" v-for="item in orderInfoData" :key="item.id" @tap="orderSel(item.orderlink)">
					<text :class="item.ordericon"></text>
					<text>{{ item.ordertitle }}</text>
				</view>
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
				isLogin:false,
				userName:"sadasd",
				orderInfoData:[
						{id:1,ordericon:'tlwok-icon tlwicon-vipcard',ordertitle:'待付款',orderlink:'/pages/order/order?item=1'},
						{id:6,ordericon:'tlwok-icon tlwicon-text',ordertitle:'待发货',orderlink:'/pages/order/order?item=4'},
						{id:2,ordericon:'tlwok-icon tlwicon-deliver',ordertitle:'待收货',orderlink:'/pages/order/order?item=2'},
						{id:3,ordericon:'tlwok-icon tlwicon-comment',ordertitle:'待评价',orderlink:'/pages/order/order?item=3'},
						{id:4,ordericon:'tlwok-icon tlwicon-recharge',ordertitle:'售后/退款',orderlink:'/pages/afterSale/afterSale'},
						// {id:5,ordericon:'tlwok-icon tlwicon-calendar',ordertitle:'我的订单',orderlink:'/pages/order/order?item=0'}
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
				uni.navigateTo({
					url: '/pages/setting/setting',
					animationType: 'pop-in',
					animationDuration: 200
				});
			},
			userTo:function(index){
				let link = '';
				switch (index){
					case 'login':
						link = '/pages/login/login'
						break;
					case 'register':
					link = '/pages/register/register'
						break;
					default:
						break;
				}
				uni.navigateTo({
					url: link,
					animationType: 'pop-in',
					animationDuration: 200
				})
			},
			orderSel: function(link){
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

.mine{
	.topCon{
		width: 100%;
		height: 300upx;
		background-image: linear-gradient(45deg, #ffb516, #ff4545);
		margin-top: 84upx;
		.settings{
			 display: flex;
			 justify-content: space-between;
			 a{
				margin:30upx 20upx;
				font-size: 20upx;
				color: #fff;
				background: rgba(0,0,0,.2);
				border-radius: 24upx;
				text-decoration: none;
				padding: 14upx;
				height: 20upx;
				line-height: 20upx;
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
			 .userLogin{
				 display: flex;
				 justify-content: space-between;
				 view{
					 display: inline-block;
					 width: 160upx;
					 height: 50upx;
					 line-height: 50upx;
					 text-align: center;
					 color: #fff;
					 margin: 10upx 20upx;
					 border:2upx solid #fff;	
					 box-sizing: border-box;
				 }
			 }
		 }
	}
	.orderInfo{
		width: 100%;
		background-color: #ffffff;
		margin-top: 20upx;
		margin-bottom: 20upx;
		.allOrder{
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: nowrap;
			width: 100%;
			height: 100upx;
			border-bottom: 2upx solid #e2e7e9;
			box-sizing: border-box;
			padding: 0 20upx;
			i{display: inline-block}
		}
		.orderOthers{
			display: flex;
			justify-content: center;
			align-items: center;
			height: 160upx;
		}
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
		height: 400upx;
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
