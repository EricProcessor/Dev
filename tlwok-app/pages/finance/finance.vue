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
			<swiper-item v-for="(financeItems,index1) in financeList" :key="index1">
				<scroll-view class="list" scroll-y @scrolltolower="loadMore(index1)">
					<template v-if="financeItems.length > 0">
						<block v-for="(item,index2) in financeItems" :key="index2">
							<financeList :options="item"></financeList>
						</block>
					</template>
					<template v-else>
						<view class="noList">
							<view class="icon">
								<i class="tlwok-icon">&#xe791</i>
							</view>
							<view class="text">
								<view>您没有账单记录哦~</view>
							</view>
						</view>
					</template>
					
					<!-- <view class="uni-tab-bar-loading">
						{{tab.loadingText}}
					</view> -->
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>
<script>
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import financeList from '@/components/list/financeList.vue'
	export default {
		components: {
			uniLoadMore,
			financeList
		},
		data() {
			return {
				scrollLeft: 0,
				tabIndex: 0,
				isClickChange: false,
				tabBars: [{
					name: '待还款',
					status: '0',
					number: 1,
					id: 'pendingRepayment'
					
				}, {
					name: '已还款',
					status: '1',
					number: 13,
					id: 'pay'
				}, {
					name: '已退款',
					status: '2',
					number: 30,
					id: 'reimbursement'
				}],
				financeList: {
					pendingRepayment:[],
					reimbursement:[],
					refunded:[]
				}
			}
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
				width: 33%!important;
				text-align: center;
				height: 50px;
				line-height: 50px;
				box-sizing: border-box;
			}
			.active{
				color: #e4393c;
			}
		}
	}
</style>
