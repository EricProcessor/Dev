<template>
	<view>
		<view class="itemCon">
			<view class="itemLeft" @tap="detailInfo(options.itemId)">
				<image :src="options.picUrl" lazy-load="true" mode=""></image>
			</view>
			<view class="itemRight">
        <view  @tap="detailInfo(options.itemId)">
          <view class="itemName">{{options.itemName}}</view>
          <view class="itemOther">
            {{options.shopAddress}}
            <span>成交：{{options.salenum}}笔</span>
          </view>
          <view class="itemShop">
            <view><i class="tlwok-icon tlwicon-shop"></i></view>
            <view><span>{{options.shopName}}</span></view>
          </view>
        </view>
				<view class="itemPrice">
					<view class="price">¥ {{options.minPrice}}~{{options.maxPrice}}</view>
					<view class="icon" @tap="addCart(options.itemId)"><i class="tlwok-icon tlwicon-cart"></i></view>
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
			}
    },
    data(){
      return{}
    },
		methods:{
			detailInfo (itemId){
        	uni.navigateTo({
						url: '/pages/productDetail/productDetail?pid='+itemId,
						animationType: 'pop-in',
						animationDuration: 200
					})
			},
			addCart (itemId){
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
		background: #fff;
		margin-bottom: 10px;
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
			}
			.itemShop{
				display: flex;
				justify-content: flex-start;
        height: 40upx;
        margin: 12upx 0;
				view{
					line-height: 40upx;
					font-size: 26upx;
          color: #999;
          span{
            padding-left: 8upx;
          }
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
          i{
            font-size: 44upx;
          }
				}
			}
		}
	}
</style>
