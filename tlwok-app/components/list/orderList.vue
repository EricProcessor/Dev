<template>
	<view class="orderItem">
			<view class="topTitle">
				<view class="item">
					<text class="tlwok-icon tlwicon-shop"></text>
					<text>{{ options.shopname }} </text>
					<text class="tlwok-icon tlwicon-right"></text>
				</view>
				<view class="item">
					<text class="proTag"> {{ options.name }} </text>
					<text class="tlwok-icon tlwicon-delete" @tap="deleteProduct"></text>
				</view>
			</view>
			<view class="productitem">
				<image :src="options.imageurl" mode=""></image>
				<text> {{ options.ordertitle }} </text>
			</view>
			<view class="productcount">
				<text>共{{ options.count }}件商品</text>
				<text>实付款:<text class="pricestyle">¥{{ options.price }}</text> </text>
			</view>
			<view class="titleTag">
				<template v-if="options.name=='待付款'">
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.name=='待收货'">
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.name=='待评价'">
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.name=='已完成'">
					<view class="item">再次购买</view>
				</template>
				<template v-if="options.name=='已关闭'">
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
				default: function(e) {
					return {}
				}
			},
		},
		data(){
			return{
				// test:this.options.name//
			}
		},
		onLoad() {
			// console.log( JSON.stringify(this.test) )
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

			text {
				margin-left: 15upx;

				.pricestyle {
					font-weight: bold;
					margin: 0;
				}
			}
		}

		.titleTag {
			width: 100%;
			display: flex;
			padding: 10upx 0;
			border-top: 2upx solid #F5F5F5;
			justify-content: flex-end;

			.item {
				background-color: #e4093c;
				color: #fff;
				padding: 10upx;
				border-radius: 10upx;
			}
		}
	}
</style>
