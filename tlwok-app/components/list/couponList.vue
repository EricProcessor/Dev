<template>
	<view>
		<view class="list-cell" hover-class="uni-list-cell-hover" @click="bindClick">
			<view class="list-left">
				<view class="left-top">¥{{options.price}}</view>
				<view class="left-bottom">满{{options.priceRange}}元可用</view>
			</view>
			<view class="list-right">
				<view class="">
					<view>{{options.name}}</view>
					<view>{{options.applicable_scope}}</view>
				</view>
				<view class="">有效期至：{{options.timeRange}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			options: {
				type: Object,
				default: function(e) {
					return {}
				}
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped lang="scss">
	view {
		.list-cell{
			display: flex;
			padding: 20upx;
			background: #ffffff;
			margin: 10px;
			border-radius: 10upx;
			.list-left{
				width: 35%;
				text-align: center;
				.left-top{
					height:140upx;
					line-height: 140upx;
				}
				.left-bottom{
					height:60upx;
					line-height: 60upx;
				}
			}
			.list-right{
				width: 65%;
			}
		}
	}
</style>
