<template>
	<view>
		<mHeader :mTitle="mTitle" :showBack="showBack"></mHeader>
		<view class="Content">
			<view v-if="orderList.length == 0" class="noList">
				<image src="/static/image/tips-icon4.png" mode=""></image>
				<view class="text">
					您还没有相关订单
				</view>
			</view>
			<view class="listCon">
				<view class="orderHeader">
					<view 
						v-for="(item,index) in tabBars" 
						:class="['tab-item',tabIndex==item.id ? 'active' : '']" 
						:data-index="item.id"
						@tap="changeOrder(item.id)"
						> 
						{{item.name}}
					</view>
				</view>
				<view class="orderCon">
					1
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import mHeader from '@/components/headerTop/index.vue'
	export default {
		data() {
			return {
				mTitle:'全部订单',
				showBack: true,
				tabIndex: 'all',
				tabBars:[{
					name: '全部',
					id: 'all'
				}, {
					name: '待付款',
					id: 'fukuan'
				},{
					name: '待发货',
					id: 'fahuo'
				}, {
					name: '待评价',
					id: 'pingjia'
				}, {
					name: '退款/售后',
					id: 'other'
				}],
				orderList:[{
					id:111
				}],
				
			};
		},
		components:{
			mHeader
		},
		methods:{
			changeOrder:function (index){
				this.tabIndex = index;
			}
		}
	}
</script>

<style scoped lang="scss">
	.Content{
		padding: 90upx 0 0 0;
		.noList{
			text-align: center;
			image{
				width: 200upx;
				height: 200upx;
				margin: 0 auto;
				margin-top: 200upx;
			}
			.text{
				font-size: 30upx;
				color: #999;
				line-height: 44upx;
				margin-top: 30upx;
			}
		}
		.listCon{
			.orderHeader{
				width: 100%;
				height: 100upx;
				line-height: 100upx;
				text-align: center;
				box-sizing: border-box;
				.tab-item{
					width: 20%;
					height: 100upx;
					line-height: 100upx;
					display: inline-block;
				}
				.active{
					color:#e4393c;
					border-bottom: 4upx solid #e4393c;
				}
			}
			.orderCon{
				height: 100%;
				
			}
		}
	}
</style>
