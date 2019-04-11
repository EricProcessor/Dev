<template>
	<view>
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<i class="tlwok-icon tlwicon-back"></i>
			<text>全部订单</text>
			<i class="tlwok-icon tlwicon-mark"></i>
		</view>
		<!-- 占位 -->
		<view class="place"></view>
		订单页面
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
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
	position: fixed;
	top: 0;
	z-index: 10;
	background-color: #fff000;
	/*  #ifdef  APP-PLUS  */
	top: var(--status-bar-height);
	/*  #endif  */
	
}
.place {
	background-color: #ffffff;
	height: 88upx;
	/*  #ifdef  APP-PLUS  */
	// margin-top: var(--status-bar-height);
	/*  #endif  */
}
</style>
