<template>
	<view class="orderCon">
		<view class="allOrder">
			<view class="allOrderItem">
				我买到的货品
			</view>
			<view class="allOrderItem" @tap="routerTo($event)" data-type="allOrder">
				全部订单
				<i class="rightArrow"></i>
			</view>
		</view>
		<view class="orderList">
			<view class="orderListItem" v-for="(item,index) in orderList" @tap="routerTo($event)" data-type="orderList">
				<view class="orderItemImg" :class="item.position"></view>
				<view class="orderItemTitle">{{ item.title }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderList:[{
					title:'待付款',
					position:'orderItemImg01'
				},{
					title:'待发货',
					position:'orderItemImg02'
				},{
					title:'待收货',
					position:'orderItemImg03'
				},{
					title:'待评价',
					position:'orderItemImg04'
				},{
					title:'退款/售后',
					position:'orderItemImg05'
				}],
				routerType:{
					'allOrder': '/pages/order/order',
					'orderList': '/pages/order/order'
				},
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
	.orderCon{
		margin-top: 20upx;
		border-top: 2upx solid #e2e7e9;
		border-bottom: 2upx solid #e2e7e9;
		background: #fff;
		box-sizing: border-box;
		color: #1a1a1a;
		font-size: 28upx;
		.allOrder,.orderList{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-between;
			border-bottom: 2upx solid #e2e7e9;
			height: 90upx;
			box-sizing: border-box;
			.allOrderItem{
				position: relative;
				line-height: 90upx;
				padding: 0 60upx 0 20upx;
				.rightArrow{
					background: url(../../../../static/image/sprites.png) no-repeat;
					background-size: 350upx auto;
					display: block;
					background-position: -200upx -100upx;
					width: 20upx;
					height: 32upx;
					position: absolute;
					top: 28upx;
					right: 20upx;
				}
			}
		}
		.orderList{
			border: none;
			height: 120upx;
			.orderListItem{
				width: 20%;
				font-size: 24upx;
				text-align: center;
				padding: 20upx 0;
				.orderItemImg{
					background: url(../../../../static/image/sprites.png) no-repeat;
					background-size: 175px auto;
					display: block;
					width: 48upx;
					height: 48upx;
					margin: 0 auto;
				}
				.orderItemTitle{
					display: inline-block;
				}
				.orderItemImg01{
					background-position: 0 -300upx;
				}
				.orderItemImg02{
					background-position: -50upx -300upx;
				}
				.orderItemImg03{
					background-position: -100upx -300upx;
				}
				.orderItemImg04{
					background-position: -150upx -300upx;
				}
				.orderItemImg05{
					background-position: -200upx -300upx;
				}
			}
		}
	}
</style>
