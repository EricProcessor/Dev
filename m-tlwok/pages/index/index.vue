<template>
	<view class="content">
        <Home v-if="page_code=='0'"></Home>
        <Supplier v-if="page_code=='1'"></Supplier>
        <Coupon v-if="page_code=='2'"></Coupon>
		<Cart v-if="page_code=='3'"></Cart>
		<Mine v-if="page_code=='4'"></Mine>
		<footerBar v-on:currentValue="currentValue"></footerBar>
	</view>
</template>

<script>
	import Home from './home/home.vue'
	import Supplier from './supplier/supplier.vue'
	import Coupon from './coupon/coupon.vue'
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
			Coupon,
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
	.content {
		text-align: center;
		height: 400upx;
	}
    .logo{
        height: 200upx;
        width: 200upx;
        margin-top: 200upx;
    }
	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>
