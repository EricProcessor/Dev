<template>
	<view>
		<view class="itemCon" @longtap="delHistory(options.itemId)">
			<view class="itemLeft">
				<image :src="options.picUrl" lazy-load="true" mode=""></image>
			</view>
			<view class="itemRight">
				<view class="itemName">{{options.itemName}}</view>
				<view class="itemOther">
					{{options.shopAddress}}
					<span>成交：{{options.salenum}}笔</span>
				</view>
				<view class="itemShop">
					<view><i class="tlwok-icon">&#xe676</i></view>
					<view><span>{{options.shopName}}</span></view>
				</view>
				<view class="itemPrice">
					<view class="price">¥ {{options.Price}}</view>
					<view class="icon" @tap="addCart(options.itemId)"><i class="tlwok-icon">&#xe6af</i></view>
				</view>
			</view>
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
			}
		},
		methods:{
			delHistory:function (itemId){
				console.log(itemId);
				console.log("删除一条浏览记录")
			},
			addCart:function (itemId){
				console.log(itemId);
				console.log("加入购物车成功")
			}
		}
	}
	
</script>

<style scoped lang="scss">
	.itemCon{
		display: flex;
		height: 220upx;
		justify-content: space-between;
		padding: 20upx;
		.itemLeft{
			padding-top: 10upx;
			image{
				width: 200upx;
				height: 200upx;
			}
		}
		.itemRight{
			width: 100%;
			padding-left: 20upx;
			border-bottom: 1px dashed #ccc;
			box-sizing: border-box;
			.itemName{
				height: 74upx;
				line-height: 36upx;
				font-size: 28upx;
				text-overflow: ellipsis;
				-webkit-line-clamp: 2;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				overflow: hidden;
				font-weight: normal;
				color: #1e1e1e;
				text-overflow: ellipsis;
				-webkit-line-clamp: 2;
			}
			.itemOther{
				font-size: 26upx;
				color: #999;
				span{
					margin-left: 20upx;
				}
			}
			.itemShop{
				display: flex;
				justify-content: flex-start;
				height: 40upx;
				view{
					line-height: 40upx;
					font-size: 26upx;
					color: #999999;
				}
			}
			.itemPrice{
				display: flex;
				justify-content: space-between;
				.price{
					color: #e4393c;
					font-size: 30upx;
				}
				.icon{
					padding-right: 20upx;
					font-size: 36upx;
					color: #e4393c;
				}
			}
		}
	}
</style>
