<template>
	<view>
		<template v-if="showtype == 'allGoods'">
			<view class="allGoods" :data-id="options.itemId">
				<view class="left">
					<image lazy-load :src="options.imgUrl" mode=""></image>
				</view>
				<view class="right">
					<p>{{options.itemName}}</p>
					<p>成交 {{options.saleNum}} 笔</p>
					<p><i class="tlwok-icon tlwicon-shopfill"></i>{{options.shop}}</p>
					<p><i class="tlwok-icon">¥</i>{{options.price}}</p>
				</view>
			</view>
		</template>
		<template v-if="showtype == 'newGoods'">
			<view class="newGoods">
				2
			</view>
		</template>
		<template v-if="showtype == 'newCoupon'">
			<view class="newCoupon">
				3
			</view>
		</template>
	</view>
</template>

<script>
	export default{
		props:{
			options: {
				type: Object,
				default: function(e) {
					return {}
				}
			},
			showtype:{
				type: String,
				required: true,
			}
		}
	}
</script>

<style scoped lang="scss">
	.allGoods{
		display: flex;
		justify-content: flex-start;
		background: #fff;
		margin-bottom: 10upx;
		padding: 10upx 20upx;
		.left{
			image{
				width: 200upx;
				height: 200upx;
			}
		} 
	}
</style>
