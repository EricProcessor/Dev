<template>
	<view class="content">
        
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

			// footerBar
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
