<template>
	<view>
		<mHeader :mTitle="mTitle" :showBack="showBack"></mHeader>
		<view class="Content">
			<user></user>
			<order></order>
			<otherItem></otherItem>
		</view>
	</view>
</template>

<script>
	import mHeader from '@/components/headerTop/index.vue'
	import user from './user/user.vue'
	import order from './order/order.vue'
	import otherItem from './otherItem/otherItem.vue'
	export default {
		data() {
			return {
				mTitle:'买家中心',
				showBack: false
			};
		},
		components:{
			mHeader,
			user,
			order,
			otherItem
		}
	}
</script>

<style>
	.Content{
		padding: 90upx 0 0 0;
		font-family:"Microsoft YaHei";
	}
</style>
