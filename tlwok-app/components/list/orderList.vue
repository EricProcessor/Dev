<template>
	<view class="orderItem" v-if="options.addHide">
			<view class="topTitle">
				<view class="item">
					<text class="tlwok-icon tlwicon-shop"></text>
					<text>{{ options.shopName }} </text>
					<text class="tlwok-icon tlwicon-right"></text>
				</view>
				<view class="item">
					<text class="proTag"> {{ options.state==10?'待付款':options.state==20?'待发货':options.state==30?'待收货':options.state==99?'订单完成':'待评价' }} </text>
					<text class="tlwok-icon tlwicon-delete" @tap="deleteProduct"></text>
				</view>
			</view>
      <view class="productitem">
        <image v-for="(img,i) in options.items" :key="i" :src="img.pictureUrl" mode=""></image>
      </view>
      <view class="productcount">
        <text>共{{ options.allCount }}件商品</text>
        <text>实付款：<text class="pricestyle">¥{{ options.paymentPrice }}</text> </text>
      </view>
			
			<view class="titleTag">
				<template v-if="options.state==10">
          <view class="item">点击付款</view>
					<view class="item">再次购买</view>
				</template>
        <template v-if="options.state==20">
          <view class="item">等待发货</view>
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.state==30">
          <view class="item">确认收货</view>
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.name==991">
          <view class="item">点击评价</view>
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.state==99">
					<view class="item">再次购买</view>
				</template>
			</view>

	</view>
</template>

<script>
	export default {
		props: {
			options: {
				type: Object,
			},
		},
		data(){
			return{
				// test:this.options.name//
			}
		},
		onLoad(options) {
			console.log(this.options)
    },
		methods: {
			deleteProduct() {
				console.log("删除商品操作");
			}
		}
	}
</script>

<style lang="scss" scoped>
	.orderItem {
		display: flex;
		flex-direction: column;
		background-color: #fff;
		margin-top: 20upx;
		padding: 15upx 25upx;

		.topTitle {
			display: flex;
			justify-content: space-between;
			width: 100%;
      padding: 20upx 0;
			.item {
				display: flex;
				justify-content: center;
				align-items: center;
				font-weight: bold;

				.tlwicon-delete {
					padding-left: 20upx;
				}

				.tlwicon-shop {
					color: #e4093c;
					margin-right: 10upx;
				}

				.proTag {
					font-weight: normal;
				}
			}
		}

		.productitem {
			width: 100%;
			display: flex;
			background-color: #FAFAFA;
			padding: 10upx 0;

			image {
				width: 150upx;
				height: 150upx;
				border-radius: 10upx;
				margin-right: 10upx;
			}

			text {
				width: 520upx;
			}
		}

		.productcount {
			width: 100%;
			display: flex;
			justify-content: flex-end;
      padding: 20upx 0; 
			text {
				margin-left: 15upx;
        padding-right: 10upx;
				.pricestyle {
					font-weight: bold;
          margin: 0;
          color: #e4093c;
          padding-left: 10upx;
				}
			}
		}

		.titleTag {
			width: 100%;
			display: flex;
			padding: 18upx 0;
			border-top: 2upx solid #F5F5F5;
			justify-content: flex-end;

			.item {
				background-color: #e4093c;
				color: #fff;
				padding: 10upx;
        border-radius: 10upx;
        margin-left: 16upx;
			}
		}
	}
</style>
