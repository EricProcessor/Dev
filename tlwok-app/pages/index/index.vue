<template>
	<view class="content">
		<view class="">
			111
		</view>
		<!-- <footerBar v-on:currentValue="currentValue"></footerBar> -->
	</view>
</template>

<script>
	// import footerBar from '@/components/footerBar/footerBar.vue'
	export default {
		data() {
			return {
				page_code: '0'
			}
		},
		components:{
			// footerNav
		},
		onLoad() {

		},
		methods:{
			currentValue: function (value){
				this.page_code = value
			}
		}
	}
</script>

<style>
	
</style>
