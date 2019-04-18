<template>
	<view class="uni-tab-bar">
		<scroll-view id="tab-bar" class="uni-swiper-tab" scroll-x :scroll-left="scrollLeft">
			<view v-for="(tabItem,index) in tabBars" 
			 :key="index" 
			 class="swiper-tab-list tabItem" 
			 :class="tabIndex==index ? 'active' : ''" :id="tabItem.id"
			 :data-current="index" @click="tapTab(index)">
				{{tabItem.name}}({{tabItem.number}})
			</view>
		</scroll-view>
		<swiper :current="tabIndex" class="swiper-box" :duration="300" @change="changeTab">
			<swiper-item v-for="(items,index1) in favoriteItems" :key="index1">
				<scroll-view class="list" scroll-y @scrolltolower="loadMore(index1)">
					<block v-for="(item,index2) in items" :key="index2">
						<favoriteList :options="item" :index="index1" :editStatus="editStatus" :checkStatus="checkStatus"></favoriteList>
					</block>
					<!-- <view class="uni-tab-bar-loading">
						{{tab.loadingText}}
					</view> -->
				</scroll-view>
			</swiper-item>
		</swiper>
		<view class="editView" v-if="editStatus==1">
			<view class="allC">
				<label class="radio"><radio value="r2" />全选</label>
			</view>
			<view class="editBtn">取消收藏</view>
		</view>
	</view>
</template>
<script>
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import favoriteList from '@/components/list/favoriteList.vue'
	export default {
		components: {
			uniLoadMore,
			favoriteList
		},
		data() {
			return {
				editStatus:0,
				scrollLeft: 0,
				tabIndex: 0,
				checkStatus:false,
				isClickChange: false,
				tabBars: [{
					name: '商品',
					number: 5,
					id: 'noused'
					
				}, {
					name: '供应商',
					number: 10,
					id: 'used'
				}],
				favoriteItems: {
					goods:[{
						id:'213',
						itemName:'天朝酒',
						saleNum:'8',
						minSellPrice:1,
						maxSellPrice:500,
						mainPictureUrl:'http://img-b2b.jcloudcs.com/f8a8523b-e492-4d9d-95a3-32bf5e09cc45.jpg'
					},{
						id:'21213',
						itemName:'得力9082百事贴(混)76*76mm(包)便利贴告示贴N次贴易事贴便签本便签纸216包/箱颜色随机',
						saleNum:'12',
						minSellPrice:50,
						maxSellPrice:500,
						mainPictureUrl:'http://img-b2b.jcloudcs.com/04199f8c-04b8-46ef-9c2f-f654e1021563.jpg'
					}],
					shop:[{
						id:'212133',
						shopName:'平台自营店',
						shopLogo:'http://img-b2b.jcloudcs.com/6394e5a5-1f02-4c10-9890-9d28ddc8b22e.png',
						introduce:"妥了网平台自营店",
						shopLevel:4,
						shopCount:8560
					},{
						id:'2131214',
						shopName:'天章纸品上海店',
						shopLogo:'http://img-b2b.jcloudcs.com/6394e5a5-1f02-4c10-9890-9d28ddc8b22e.png',
						introduce:"妥了网平台自营店",
						shopLevel:3,
						shopCount:8560
					},{
						id:'256214',
						shopName:'黄牛的牛店',
						shopLogo:'http://img-b2b.jcloudcs.com/38159703-a54b-4589-947b-e765c336981a.jpg',
						introduce:"本公司致力于产品规划以及超性价比产品开发，选择华坤等于选择了一个职业采购团队。",
						shopLevel:1,
						shopCount:8560
					}]
				}
			}
		},
		onNavigationBarButtonTap() {
			let pages = getCurrentPages();
			let page = pages[pages.length - 1];
			this.editStatus = this.editStatus == 0 ? 1 : 0;
			this.checkStatus = false;
			// #ifdef APP-PLUS
			let currentWebview = page.$getAppWebview();
			let titleObj = currentWebview.getStyle().titleNView;
			if (!titleObj.buttons) {
				return;
			}
			titleObj.buttons[0].text = titleObj.buttons[0].text === "编辑" ? "完成" :"编辑";
			currentWebview.setStyle({
				titleNView: titleObj
			});
			// #endif
		},
		onLoad: function() {
			
		},
		methods: {
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
	.uni-tab-bar{
		.uni-swiper-tab{ //couponHeader
			background: #ffffff;
			border: none;
			.tabItem {
				display: inline-block;
				width: 50%!important;
				text-align: center;
				height: 50px;
				line-height: 50px;
				box-sizing: border-box;
			}
			.active{
				color: #e4393c;
			}
		}
		.editView{
			position: fixed;
			left: 0;
			bottom: 0;
			z-index: 999;
			width: 100%;
			background: #e8eff4;
			display: flex;
			justify-content: flex-start;
			view{
				display: inline-block;
				height: 100upx;
				line-height: 100upx;
			}
			.allC{
				width: 70%;
				color: #666;
				padding-left: 50upx;
			}
			.editBtn{
				width: 30%;
				color: #fff;
				text-align: center;
				background: #e4393c;
			}
		}
	}
	
	
	
</style>
