<template>
	<view>
        <Home v-if="page_code=='0'"></Home>
        <Supplier v-if="page_code=='1'"></Supplier>
		<Cart v-if="page_code=='2'"></Cart>
		<Mine v-if="page_code=='3'"></Mine>
		<footerBar v-on:currentValue="currentValue"></footerBar>
	</view>
</template>

<script>
	import Home from './home/home.vue'
	import Supplier from './supplier/supplier.vue'
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

<style>

</style>
