<template>
	<view>
		<view class="list-cell"
		 :class="checkStatus?'itemActive':''"
		 @tap="itemTap($event,checkStatus)"
		 :data-status="checkStatus"
		 :data-id="options.id">
			<template v-if="index == 'goods'">
				<view class="list-left" :data-type="index">
					<image :src="options.describeUrl" lazy-load="true" mode="heightFix"></image>
				</view>
				<view class="list-right">
					<view class="item itemName">{{options.itemName}}</view>
					<view class="item itemSaleNum">成交: {{options.saleNum}} 笔 </view>
					<view class="item itemShop">
						<view><i class="tlwok-icon tlwicon-shop"></i></view>
						<view><span>天章自营店</span></view>
					</view>
					<view class="item itemPrice">
						<view class="itemPriceRange">¥{{options.minSellPrice}}~¥{{options.maxSellPrice}}</view>
						<view class="wholesale">1件起批</view>
					</view>
				</view>
			</template>
			<template v-else :data-type="index">
				<view class="list-left" :data-type="index">
					<image :src="options.logoUrl" lazy-load="true" mode="heightFix"></image>
				</view>
				<view class="list-right">
					<view class="item itemName">{{options.shopName}}</view>
					<view class="item itemIntroduce">经营类目: {{options.introduce}} </view>
					<view class="item itemRate"><uni-rate :disabled="true" :size="16" :value="options.shopLevel"></uni-rate></view>
					<view class="item itemIntroduce">成交数量: {{options.shopCount}} 笔</view>
				</view>
			</template>
		</view>
	</view>
</template>

<script>
	import uniRate from '@/components/uni-rate/uni-rate.vue'
	export default {
		components:{
			uniRate
		},
		props: {
			options: {
				type: Object,
				default: function(e) {
					return {}
				}
			},
			index:{
				type: String,
				required: true,
			},
			editStatus:{
				type: Number,
				required: true,
			},
			checkStatus:{
				type: Boolean,
				required: true,
			}
		},
		methods: {
			itemTap:function (e,checkStatus){
				if(this.editStatus == 1){
					if(checkStatus){
						this.checkStatus = false
					}else{
						this.checkStatus = true
					}
				}else{
					console.log("跳转页面")
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.itemActive{
		border: 1px solid #e4393c!important;
	}
	.list-cell{
		display: flex;
		background: #ffffff;
		margin: 10px;
		border-radius: 10upx;
		overflow: hidden;
		position: relative;
		border: 1px solid transparent;
		box-sizing: border-box;
		.list-left{
			padding:10upx;
			height: 200upx;
			image{
				width: 200upx;
        height: 200upx;
        border: 1px solid #eee;
			}
		}
		.list-right{
			padding: 10upx 10upx 10upx 40upx;
			width: 440upx;
			.item{
				line-height: 48upx;
				margin-bottom: 10upx;
			}
			.itemName{
				font-size: 28upx;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			.itemSaleNum,.itemShop{
				display: flex;
				justify-content: flex-start;
				height: 40upx;
				line-height: 40upx;
				font-size: 26upx;
				color: #999999;
			}
			.itemPrice{
				display: flex;
				justify-content: space-between;
				.itemPriceRange{
					color: #e4393c;
					font-size: 30upx;
				}
				.wholesale{
					color: #666666;
          font-size: 26upx;
          padding-right: 10upx;
				}
			}
			.itemIntroduce{
				font-size: 26upx;
				color: #999999;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
	}
</style>
