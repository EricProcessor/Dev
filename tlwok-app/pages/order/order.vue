<template>
	<view>
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<i class="tlwok-icon tlwicon-back" @tap="back()"></i>
			<view class="centers" @click="togglePopup('top')">
				<text>全部订单</text>
				<i class="tlwok-icon tlwicon-unfold unfold"></i>
			</view>
			<i class="tlwok-icon tlwicon-mark"></i>
		</view>
		<!-- 占位 -->
		<view class="place"></view>
		订单页面
		<uni-popup :show="type === 'top'" position="top" mode="fixed" @hidePopup="togglePopup('')">
			sdsdfsdkfjsdkfjsdkfjs
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	export default {
		components: {
			uniPopup
		},
		data() {
			return {
				type: '',
			};
		},
		onBackPress() {
			if (this.type !== '') {
				this.type = '';
				return true;
			}
		},
		methods:{
			back(){
				uni.navigateBack({
					delta:1
				})
			},
			togglePopup(type) {
				this.type = type;
				console.log("111111")
			}
		}
	}
</script>

<style lang="scss">
.status_bar {  
	    height: var(--status-bar-height);  
	    width: 100%;  
	    background-color: #FFFFFF;  
	}  
	.top_view {  
	    height: var(--status-bar-height);  
	    width: 100%;  
	    position: fixed;  
	    background-color: #FFFFFF;  
	    top: 0;  
	    z-index: 999;  
	}  
	.header{
		width: 100%;
		height: 88upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: fixed;
		top: 0;
		z-index: 10;
		background-color: #ffffff;
		/*  #ifdef  APP-PLUS  */
		top: var(--status-bar-height);
		/*  #endif  */
		.tlwok-icon{
			font-size: 46upx;
			padding: 0 20upx;
		}
		.centers{
			display: flex;
			.unfold{
				font-size: 25upx;
			}	
		}
	}
	.place {
		background-color: #ffffff;
		height: 88upx;
		/*  #ifdef  APP-PLUS  */
		// margin-top: var(--status-bar-height);
		/*  #endif  */
	}
	.uni-popup-top{
		top:200upx
	}
</style>
