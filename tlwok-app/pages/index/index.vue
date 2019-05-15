<template>
	<view class="content">
        <Home v-if="page_code=='0'"></Home>
        <Supplier v-if="page_code=='1'"></Supplier>
		<!-- <Category v-if="page_code=='2'"></Category> -->
		<Cart v-if="page_code=='3'"></Cart>
		<Mine v-if="page_code=='4'"></Mine>
		<footerBar v-on:currentValue="currentValue"></footerBar>
	</view>
</template>

<script>
	import Home from './home/home.vue'
	import Supplier from './supplier/supplier.vue'
	// import Category from './category/category.vue'
	import Cart from './cart/cart.vue'
	import Mine from './mine/mine.vue'
	import footerBar from '@/components/footerBar/footerBar.vue'
	export default {
		data() {
			return {
				page_code: '0'
			}
		},
		components:{
			Home,
			Supplier,
			Cart,	
			// Category,
			Mine,
			footerBar
		},
		onLoad() {
			
		},
		methods: {
			currentValue: function (value){
				this.page_code = value
			}
		}
	}
</script>

<style scoped lang="scss">
	.content{
		height: 100%
	}
</style>
