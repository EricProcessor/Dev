<template>
	<view>
		<!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<view style="margin:0 auto;font-size: 32upx;font-weight: 700;">
				供应商
			</view>
		</view>
		<view class="place"></view>
		<!-- 自定义导航头结束 -->
		<scroll-view scroll-y
		 class="supply-list"  style="padding-bottom: 100upx;" 
		 @scrolltolower="loadMore()">
			<block v-for="(item,index) in supply_list" :key="index">
				<supplyList :options="item"></supplyList>
			</block>
			<!-- <view class="uni-tab-bar-loading">
				{{tab.loadingText}}
			</view> -->
			
		</scroll-view>
		
	</view>
</template>

<script>
	import supplyList from '@/components/list/supplyList.vue';
	export default {
		components:{
			supplyList
		},
		data() {
			return {
				supply_list:[{
					shopId:1003524,
					shopName:"天章纸品集团-北京店",
					shopLogo:"http://img-b2b.jcloudcs.com/10bb6d46-2882-4241-bbe5-44b32ed6bd58.jpg",
					introduce:"广东天章纸品集团成立于2011年，其前身是创建于1996年的广东天章信息纸品有限公司。",
					shopLevel:0,
					shopCount: 420,
					businessTime: "周一至周日 00:00-24:00"
				},{
					shopId:1003525,
					shopName:"天章纸品集团-杭州店",
					shopLogo:"http://img-b2b.jcloudcs.com/31332880-87fd-4614-8fca-5e98905fe850.jpg",
					introduce:"广东天章纸品集团成立于2011年，其前身是创建于1996年的广东天章信息纸品有限公司。",
					shopLevel:4,
					shopCount: 420,
					businessTime: "周一至周日 00:00-24:00"
				},{
					shopId:1003526,
					shopName:"天章纸品集团-重庆店",
					shopLogo:"http://img-b2b.jcloudcs.com/c17c95ca-c78e-47d8-aaef-89b748d6cb28.jpg",
					introduce:"广东天章纸品集团成立于2011年，其前身是创建于1996年的广东天章信息纸品有限公司。",
					shopLevel:3,
					shopCount: 420,
					businessTime: "周一至周日 00:00-24:00"
				},{
					shopId:1003527,
					shopName:"天章纸品集团-南京店",
					shopLogo:"http://img-b2b.jcloudcs.com/2815a193-60e3-4287-8176-8659686a01fd.jpg",
					introduce:"广东天章纸品集团成立于2011年，其前身是创建于1996年的广东天章信息纸品有限公司。",
					shopLevel:5,
					shopCount: 420,
					businessTime: "周一至周日 00:00-24:00"
				}]
			};
		},
		methods:{
			loadMore: function (){
				console.log("加载更多~~~")
			}
		}
	}
</script>

<style scoped lang="scss">
	.supply-list{
		width: 100%;
		margin-top:88upx; 
		/*  #ifdef  APP-PLUS */
		margin-top: var(--status-bar-height);
		/*  #endif  */
	}
</style>
