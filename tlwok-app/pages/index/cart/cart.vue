<template> 
	<view class="cartBox">
		<!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<view style="margin:0 auto;font-size: 32upx;font-weight: 700;">
				购物车({{cartList.length}})
			</view>
		</view>
		<view class="place"></view>
		<!-- 自定义导航头结束 -->
		<scroll-view class="cart" scroll-y="true">
			<template v-if="cartList.length > 0">
				<block v-for="(item,index) in cartList" :key="index">
					<cartList :options="item"></cartList>
				</block>
				<view class="cartAll">
					<view class="left">
						<view><radio value="" checked="true" color="#E4393C"/>全选</view>
						<view class="allprice">合计：
							<text>¥{{allPrice}}</text>
						</view>
					</view>
					<view class="toPay">去结算</view>
				</view>
			</template>
			<template v-else>
				<view class="noList">
					<view class="icon">
						<i class="tlwok-icon">&#xe6af</i>
					</view>
					<view class="text">
						<view>您的购物车内还没有商品，赶紧挑一下中意的商品吧~</view>
					</view>
				</view>
			</template>
		</scroll-view>
	</view>
	
</template>

<script>
	import cartList from '@/components/list/cartList.vue'
	export default {
		components:{
			cartList
		},
		data() {
			return {
				allPrice:111,
				cartList:[{
					shopName:"乐活文具",
					goods:[{
						imgUrl:"http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg",
						name:"得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱",
						skuAttributeNames:["颜 色:黑色","单位:包"],
						totalNum:3,
						totalMoney:119.52,
						sellPrice:39.84
					},{
						imgUrl:"http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg",
						name:"得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱",
						skuAttributeNames:["颜 色:黑色","单位:包"],
						totalNum:3,
						totalMoney:119.52,
						sellPrice:39.84
					}]
					
				},{
					shopName:"平台自营店",
					goods:[{
						imgUrl:"http://img-b2b.jcloudcs.com/51bfc320-7068-47bc-a69f-371e4fce8870.jpg",
						name:"世纪天章复印纸80g/A4/ 8包/箱 500张/包",
						skuAttributeNames:["颜 色:黑色","单位:包"],
						totalNum:1,
						totalMoney:226,
						sellPrice:226
					}]
				},{
					shopName:"天章香洲店",
					goods:[{
						imgUrl:"http://img-b2b.jcloudcs.com/51bfc320-7068-47bc-a69f-371e4fce8870.jpg",
						name:"测试1234",
						skuAttributeNames:["折式打印纸规格:三等份1/3-不撕边"],
						totalNum:1,
						totalMoney:0.1,
						sellPrice:0.1
					}]
				}]
			};
		}
	}
</script>

<style scoped lang="scss">
	.cartBox{
		height: 100%;
		.cart{
			margin-top: 84upx;
			.cartAll{
				width: 100%;
				height: 100upx;
				position: fixed;
				z-index: 998;
				bottom: 100upx;
				left: 0;
				background: #E8EFF4;
				display: flex;
				justify-content: space-between;
				.left{
					display: flex;
					justify-content: space-between;
					width: 70%;
					view{
						display: inline-block;
						line-height: 100upx;
					}
					.allprice{
						font-size: 32upx;
						text{
							font-weight: 700;
						}
					}
				}
				.toPay{
					width: 200upx;
					text-align: center;
					line-height: 100upx;
					color: #fff;
					background:#E4393C; 
				}
			}
		}
	}
</style>
