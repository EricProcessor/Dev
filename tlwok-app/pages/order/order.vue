<template>
	<view class="orderBox">
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<i class="tlwok-icon tlwicon-back" @tap="back()"></i>
			<view class="centers" @click="togglePopup('top')">
				<text>全部订单</text>
				<i class="tlwok-icon tlwicon-unfold unfold"></i>
			</view>
			<i class="tlwok-icon tlwicon-mark"></i>
		</view>
		<!-- 占位 -->
		<view class="place"></view>
		<!-- 弹框 -->
		<uni-popup :show="type === 'top'" position="top" mode="fixed" @hidePopup="togglePopup('')">
			待开发......
		</uni-popup>
		<!-- 选项卡 -->
		<view class="uni-tab-bar">			
			<scroll-view id="tab-bar" class="uni-swiper-tab" scroll-x :scroll-left="scrollLeft">
				<view v-for="(tab,index) in tabBars" :key="tab.id" class="swiper-tab-list" :class="tabIndex==index ? 'active' : ''" 
				:id="tab.id" :data-current="index" @click="tapTab">{{tab.name}}
				</view>
			</scroll-view>
			<swiper :current="tabIndex" class="swiper-box" :duration="300" @change="changeTab">
				<swiper-item v-for="(ordedatas,index1) in orderitems" :key="index1">
					<scroll-view class="list" scroll-y @scrolltolower="loadMore(index1)">
						<block v-for="(orderitem,index2) in ordedatas" :key="index2">
							<order-list :options="orderitem"></order-list>
						</block>
					</scroll-view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import orderList from '@/components/list/orderList.vue' 
	export default {
		components: {
			uniPopup,
			orderList
		},
		data() {
			return {
				type: '',//弹框位置类型
				//tab切换
				tabIndex:0,
				scrollLeft: 0,
				isClickChange: false,
				tabBars:[
					{name:'全部',id:'all'},
					{name:'待付款',id:'Pendingpayment'},
					{name:'待收货',id:'beRecived'},
					{name:'待评价',id:'beEvaluated'},
					{name:'交易成功',id:'succTrad'},
					{name:'交易关闭',id:'closeTrad'}
				],
				orderitems:{
					all:[
						{
							name:"待付款",
							shopname:"这个店铺",
							ordernum:12323,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:100.02,
							postfee:0
						},{
							name:"待付款",
							shopname:"这个店铺",
							ordernum:12323,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:100.02,
							postfee:0
						}
					],
					Pendingpayment:[
						{
							name:"待付款",
							shopname:"这个店铺",
							ordernum:12323,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:100.02,
							postfee:0
						},
						{
							name:"待付款",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						}
					],
					beRecived:[
						{
							name:"待收货",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"待收货",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"待收货",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						}
					],
					beEvaluated:[
						{
							name:"待评价",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"待评价",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"待评价",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"待评价",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						}
					],
					succTrad:[
						{
							name:"已完成",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"已完成",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						}
					],
					closeTrad:[
						{
							name:"已关闭",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						},
						{
							name:"已关闭",
							shopname:"这个店铺",
							ordernum:123093,
							tradedate:"2019-04-14 12:00",
							imageurl:"/static/image/productmini.jpg",
							count:1,
							price:110.02,
							postfee:0
						}
					]
				}
			};
		},
		onBackPress() {
			if (this.type !== '') {
				this.type = '';
				return true;
			}
		},
		methods:{
			back(){
				uni.navigateBack({
					delta:1
				})
			},
			togglePopup(type) {
				this.type = type;
			},
			async tapTab(e) { //点击tab-bar
				let tabIndex = e.target.dataset.current;
				console.log(tabIndex);
// 				if(this.newsitems[tabIndex].data.length === 0){
// 					this.addData(tabIndex)
// 				}
				if (this.tabIndex === tabIndex) {
					return false;
				} else {
					let tabBar = await this.getElSize("tab-bar"),
						tabBarScrollLeft = tabBar.scrollLeft; //点击的时候记录并设置scrollLeft
					
					this.scrollLeft = tabBarScrollLeft;
					this.isClickChange = true;
					this.tabIndex = tabIndex;
				}
			},
			async changeTab(e) {
				let index = e.target.current;
// 				if(this.newsitems[index].data.length === 0){
// 					this.addData(index)
// 				}
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
					uni.createSelectorQuery().select("#" + id).fields({
						size: true,
						scrollOffset: true
					}, (data) => {
						res(data);
					}).exec();
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
.status_bar {  
	    height: var(--status-bar-height);  
	    width: 100%;  
	    background-color: #FFFFFF;  
	}  
	.top_view {  
	    height: var(--status-bar-height);  
	    width: 100%;  
	    position: fixed;  
	    background-color: #FFFFFF;  
	    top: 0;  
	    z-index: 999;  
	}  
	.header{
		width: 100%;
		height: 88upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: fixed;
		top: 0;
		z-index: 10;
		background-color: #ffffff;
		/*  #ifdef  APP-PLUS  */
		top: var(--status-bar-height);
		/*  #endif  */
		.tlwok-icon{
			font-size: 46upx;
			padding: 0 20upx;
		}
		.centers{
			display: flex;
			.unfold{
				font-size: 25upx;
			}	
		}
	}
	.place {
		background-color: #ffffff;
		/*  #ifdef  APP-PLUS  */
		margin-top: var(--status-bar-height);
		/*  #endif  */
	}
	.active{color:#e4093c; font-weight: bold;}
	.uni-swiper-tab{border: none;background-color: #FFFFFF;}
	.orderBox{
		height: 100%;
		.uni-tab-bar {
			/* #ifdef H5 */
			margin-top: 84upx;
			/* #endif */
		}
	} 
</style>
