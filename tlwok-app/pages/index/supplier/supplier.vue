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
    props:{
      supply_list:{
        type:Array
      }
    },
		data() {
			return {
				
			}
    },
		methods:{
			loadMore (){
				console.log("加载更多~~~")
			}
    },
    components:{
			supplyList
    },
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
