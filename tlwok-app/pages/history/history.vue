<template>
	<view>
		<view class="historyList" v-for="items in historyList">
			<view class="historyTime">
				{{items.visitDate}}
			</view>
			<block v-for="(item,index2) in items.mVisitHistoryVos" :key="index2">
				<historyList :options="item"></historyList>
			</block>
		</view>
	</view>
</template>

<script>
	import historyList from '@/components/list/historyList.vue' 
	export default {
		components:{historyList},
		data() {
			return {
				historyList:[{
						visitDate:'12月11号',
						mVisitHistoryVos:[{
								itemName:'测试1',
								itemId: 12314,
								picUrl: "http://img-b2b.jcloudcs.com/0332890f-1a4b-492e-ad96-a47368c10961.jpg",
								shopAddress:"鄂尔多斯市",
								shopName:"天章香洲店",
								Price:0.1,
								salenum:4532,
								shopId:123
							},{
								itemName:'【伙拼价更优】哈尔滨秋林里道斯松仁小肚知名小吃东北特产红肠 350g/个【1个】',
								itemId: 1112740,
								picUrl: "http://file.tlwok.com/group1/M00/01/9F/CgsVD1wIvjGAHj5nAAYf2HW3NI4326.jpg",
								shopAddress:"珠海市",
								shopName:"裕善坊",
								Price:39.1,
								salenum:451232,
								shopId:123123
							},{
								itemName:'【伙拼价更优】得力4366立体声音乐耳机',
								itemId: 123142,
								picUrl: "https://file.tlwok.com/group1/M00/03/3C/CgsVD1yUreuARt1IAAaXWJp8EM4077.jpg",
								shopAddress:"珠海市",
								shopName:"妥了商城",
								Price:3.1,
								salenum:4532,
								shopId:24543
							},
						]
					},{
						visitDate:'11月13号',
						mVisitHistoryVos:[{
								itemName:'测试1',
								itemId: 12314,
								picUrl: "http://img-b2b.jcloudcs.com/0332890f-1a4b-492e-ad96-a47368c10961.jpg",
								shopAddress:"鄂尔多斯市",
								shopName:"天章香洲店",
								Price:0.1,
								salenum:4532,
								shopId:123
							},{
								itemName:'【伙拼价更优】哈尔滨秋林里道斯松仁小肚知名小吃东北特产红肠 350g/个【1个】',
								itemId: 1112740,
								picUrl: "http://file.tlwok.com/group1/M00/01/9F/CgsVD1wIvjGAHj5nAAYf2HW3NI4326.jpg",
								shopAddress:"珠海市",
								shopName:"裕善坊",
								Price:39.1,
								salenum:451232,
								shopId:123123
							},{
								itemName:'【伙拼价更优】得力4366立体声音乐耳机',
								itemId: 123142,
								picUrl: "https://file.tlwok.com/group1/M00/03/3C/CgsVD1yUreuARt1IAAaXWJp8EM4077.jpg",
								shopAddress:"珠海市",
								shopName:"妥了商城",
								Price:3.1,
								salenum:4532,
								shopId:24543
							},
						]
					}
				]
			};
		},
		onNavigationBarButtonTap() {
			console.log("清空浏览记录")
		},
		onPullDownRefresh() {
			console.log('onPullDownRefresh');
			setTimeout(() => {
				uni.stopPullDownRefresh();
			},500)
		}
	}
</script>

<style scoped lang="scss">
	.historyList{
		.historyTime{
			width: 100%;
			height: 80upx;
			box-sizing: border-box;
			padding-left: 40upx;
			line-height: 80upx;
			font-size: 40upx;
			border-bottom: 2upx solid #ccc;
		}
	}
</style>
