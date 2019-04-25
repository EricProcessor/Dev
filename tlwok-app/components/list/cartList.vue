<template>
	<view class="cartList">
		<view class="shop">
			<radio value="" :checked="shopRadio" @tap="shopRadioTap(shopRadio)" color="#E4393C"/>
			<i class="tlwok-icon">&#xe676</i>
			<view>{{options.shopName}}</view>
		</view>
		<view class="goods" v-for="(item,index) in options.goods" :key="index">
			<view class="goodsRadio">
				<radio value="" :checked="radioType" color="#E4393C" @tap="RadioTap(radioType)"/>
			</view>
			<view class="goodsInfo">
				<view class="goods_left"> 
					<image :src="item.imgUrl" mode=""></image>
				</view>
				<view class="goods_right">
					<view class="goodsName">{{item.name}}</view>
					<view class="goodsSku">
						<text v-for="(text,index1) in item.skuAttributeNames" :key="index1">{{text}}</text>
					</view>
					<view class="goodsC">
						<view class="goodsPrice">¥{{item.sellPrice}}</view>
						<view class="goodsNum">
							<uni-number-box :min="1" :value="item.totalNum"></uni-number-box>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue'
	export default{
		components: {
			uniNumberBox
		},
		data(){
			return {
				radioType: false,
				shopRadio:false
			}
		},
		props:{
			options: {
				type: Object,
				default: function(e) {
					return {}
				}
			}
		},
		methods:{
			//商品radio
			RadioTap:function (index){
				this.radioType = index == true? false :true
			},
			//店铺radio
			shopRadioTap:function (index){
				switch (index){
					case false:
						this.shopRadio = true;
						this.radioType = true;
						break;
					case true:
						this.shopRadio = false;
						this.radioType = false;
						break;
					default:
						break;
				}
				
			}
		}
	}
</script>

<style scoped lang="scss">
	.cartList{
		margin: 20upx 0;
		.shop{
			box-sizing: border-box;
			view{
				display: inline-block;
				height: 80upx;
				line-height: 80upx;
				color: #1a1a1a;
				font-size: 32upx;
				font-weight: 700;
			}
			i{
				margin: 0 10upx;
			}
		}
		.goods{
			display: flex;
			justify-content: space-around;
			margin-bottom: 20upx;
			.goodsRadio{
				line-height: 130px;
			}
			.goodsInfo{
				display: flex;
				justify-content: space-between;
				background: #fff;
				width: 100%;
				height: 260upx;
				.goods_left{
					padding-top: 30upx;
					image{
						width: 200upx;
						height: 200upx;
					}
				}
				.goods_right{
					width: 100%;
					padding:20upx;
					background: #fff;
					.goodsName{
						height: 74upx;
						line-height: 36upx;
						font-size: 28upx;
						-o-text-overflow: ellipsis;
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
					.goodsC{
						display: flex;
						justify-content: space-between;
						.goodsPrice{
							line-height: 70upx;
							color: #e4393c;
							font-size: 32upx;
						}
					}
				}
			}
		}
	}
</style>
