<template>
	<view class="shop">
		<view class="shopHeader">
			<view class="shopLeft">
				<view class="shopImg">
					<image :src="shopInfo.imgUrl" mode=""></image>
				</view>
				<view class="shopText">
					<p>{{shopInfo.text}}<span class="shopStatus">{{shopInfo.shopStatus}}</span></p>
					<p>
						<i class="tlwok-icon" style="display: inline-block;">&#xe651</i>
						<span class="shopAddress">{{shopInfo.address}}</span>
					</p>
				</view>
			</view>
			<view class="shopRight">
				<view class="fav">
					<i class="tlwok-icon">{{shopInfo.fav == 0?"&#xe669":"&#xe668"}}</i>
					<span>{{shopInfo.fav == 0?"关注":"取消关注"}}</span>
				</view>
			</view>
		</view>
		<view class="uni-tab-bar">
			<scroll-view id="tab-bar" class="uni-swiper-tab" scroll-x :scroll-left="scrollLeft">
				<view v-for="(tabItem,index) in tabBars" :key="index" 
				 class="swiper-tab-list tabItem" 
				 :class="tabIndex==index ? 'active' : ''" :id="tabItem.id"
				 :data-current="index" @click="tapTab(index)">
					{{tabItem.name}}
				</view>
			</scroll-view>
			<swiper :current="tabIndex" class="swiper-box" :duration="300" @change="changeTab">
				<swiper-item v-for="(items,index) in shopGoodsList" :key="index">
					<scroll-view class="list" scroll-y @scrolltolower="loadMore(index)">
						<block v-for="(item,index2) in items" :key="index2">
							<shopList :options="item" :showtype="index"></shopList>
						</block>
						<!-- <view class="uni-tab-bar-loading">
							{{tab.loadingText}}
						</view> -->
					</scroll-view>
				</swiper-item>
			</swiper>
		</view>
		<view class="shopBottom">
			<view class="">
				公司介绍
			</view>
			<view class="">
				商品分类
			</view>
			<view class="lianxikf">
				联系客服
			</view>
		</view>
	</view>
</template>

<script>
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import shopList from '@/components/list/shopList.vue'
	export default {
		components:{
			shopList
		},
		data() {
			return {
				shopInfo:{
					imgUrl:"http://img-b2b.jcloudcs.com/59637350-ccd0-48a8-baf4-f2ee1e8be5e2.png",
					text:"妥了网商城",
					address:"珠海市",
					fav:0,
					shopStatus:"商城自营"
				},
				scrollLeft: 0,
				tabIndex: 0,
				tabBars:[{
					name: '全部商品',
					id: 'allGoods'
				}, {
					name: '店铺上新',
					id: 'newGoods'
				}, {
					name: '店铺活动',
					id: 'newCoupon'
				}],
				shopGoodsList:{
					allGoods:[{
						itemId:1107937,
						itemName:"费列罗榛果巧克力费列罗榛果巧克力30粒/盒",
						imgUrl:"http://img-b2b.jcloudcs.com/e62a51f4-9cc5-46c9-9e8b-f23ce8f04705.jpg?img/sf/200/200",
						saleNum:30,
						price:125,
						shopId:1003511,
						shop:"妥了商城"
					},{
						itemId:1107912,
						itemName:"简魅全竹浆纸巾(抽纸)(150抽/包，3包/提，6提/箱)【1箱/18包】",
						imgUrl:"http://img-b2b.jcloudcs.com/4f699fe5-9804-4f51-af5f-e22355ca50db.jpg?img/sf/200/200",
						saleNum:3,
						price:15,
						shopId:1003511,
						shop:"妥了商城"
					},{
						itemId:1107916,
						itemName:"阿米紫草霜 30g/瓶 【1瓶】",
						imgUrl:"http://img-b2b.jcloudcs.com/4f699fe5-9804-4f51-af5f-e22355ca50db.jpg?img/sf/200/200",
						saleNum:3,
						price:15,
						shopId:1003511,
						shop:"妥了商城"
					}],
					newGoods:[{
						itemId:1107937,
						itemName:"费列罗榛果巧克力费列罗榛果巧克力30粒/盒",
						imgUrl:"http://img-b2b.jcloudcs.com/e62a51f4-9cc5-46c9-9e8b-f23ce8f04705.jpg?img/sf/200/200",
						saleNum:30,
						price:125,
						shopId:1003511,
						shop:"妥了商城"
					},{
						itemId:1107912,
						itemName:"简魅全竹浆纸巾(抽纸)(150抽/包，3包/提，6提/箱)【1箱/18包】",
						imgUrl:"http://img-b2b.jcloudcs.com/4f699fe5-9804-4f51-af5f-e22355ca50db.jpg?img/sf/200/200",
						saleNum:3,
						price:15,
						shopId:1003511,
						shop:"妥了商城"
					},{
						itemId:1107916,
						itemName:"阿米紫草霜 30g/瓶 【1瓶】",
						imgUrl:"http://img-b2b.jcloudcs.com/4f699fe5-9804-4f51-af5f-e22355ca50db.jpg?img/sf/200/200",
						saleNum:3,
						price:15,
						shopId:1003511,
						shop:"妥了商城"
					}],
					newCoupon:[{
						itemId:1107916,
						shopId:1003511,
					}]
				}
				
			};
		},
		methods:{
			loadMore(e) {
				this.newsitems[e].loadingType = 1;
				setTimeout(() => {
					this.addData(e);
				}, 1200);
			},
			async changeTab(e) {
				let index = e.detail.current;
				if (this.isClickChange) {
					this.tabIndex = index;
					this.isClickChange = false;
					return;
				}
				let tabBar = await this.getElSize("tab-bar"),
					tabBarScrollLeft = tabBar.scrollLeft;
				let width = 0;
				for (let i = 0; i < index; i++) {
					let result = await this.getElSize(this.tabBars[i].id);
					width += result.width;
				}
				let winWidth = uni.getSystemInfoSync().windowWidth,
					nowElement = await this.getElSize(this.tabBars[index].id),
					nowWidth = nowElement.width;
				if (width + nowWidth - tabBarScrollLeft > winWidth) {
					this.scrollLeft = width + nowWidth - winWidth;
				}
				if (width < tabBarScrollLeft) {
					this.scrollLeft = width;
				}
				this.isClickChange = false;
				this.tabIndex = index; //一旦访问data就会出问题
			},
			getElSize(id) { //得到元素的size
				return new Promise((res, rej) => {
					uni.createSelectorQuery().select('#' + id).fields({
						size: true,
						scrollOffset: true
					}, (data) => {
						res(data);
					}).exec();
				});
			},
			async tapTab(index) { //点击tab-bar
				if (this.tabIndex === index) {
					return false;
				} else {
					let tabBar = await this.getElSize("tab-bar");
					let	tabBarScrollLeft = tabBar.scrollLeft; //点击的时候记录并设置scrollLeft
					this.scrollLeft = tabBarScrollLeft;
					this.isClickChange = true;
					this.tabIndex = index;
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.shop{
		height: 100%;
		.shopHeader{
			height: 180upx;
			width: 100%;
			display: flex;
			justify-content: space-between;
			background-image: linear-gradient(45deg, #402F27,#E7C583,#89442E);
			color: #fff;
			.shopLeft{
				display: flex;
				justify-content: flex-start;
				height: 100upx;
				margin-top: 70upx;
				.shopImg{
					padding: 0 20upx;
					image{	
						width: 100upx;
						height: 100upx;
					}
				}
				.shopText{
					p{
						margin-bottom: 10upx;
						.shopAddress{
							margin-left: 10upx;
						}
					}
					.shopStatus{
						padding: 0 10upx;
						background: #e4393c;
						margin-left: 20upx;
					}
				}
			}
			.shopRight{
				height: 100upx;
				margin-top: 70upx;
				margin-right: 20upx;
				.fav{
					padding: 4upx 20upx;
					background: #e4393c;
					border-radius: 50upx;
					text-align: center;
					height: 40upx;
					i{
						display: inline-block;
						margin: 0 6upx 0 4upx;
					}
				}
			}
		}
		.uni-tab-bar{
			#tab-bar{
				background: #fff;
				.active{
					color: #e4393c;
				}
				.tabItem{
					width: 33%;
				}
			}
		}
		.shopBottom{
			position:fixed;
			bottom: 0;
			display: flex;
			justify-content: space-between;
			width: 100%;
			height: 100upx;
			line-height: 100upx;
			background: #fff;
			color: #506785;
			z-index: 999;
			view{
				width: 33.3%;
				text-align: center;
				box-sizing: border-box;
				border-right:2upx solid #ccc; 
			}
			.lianxikf{
				border: 0;
			}
		}
	}
</style>
