<script>
	export default {
		onLaunch: function () {
			console.log('App Launch')
		},
		onShow: function () {
			console.log('App Show')
		},
		onHide: function () {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '/common/css/iconfont.css';
	@import '/common/css/uni.css';
	page {
		background-color: #F1F0F5;
		height: 100%;
	}
	.status_bar{
		height: var(--status-bar-height);  
		width: 100%;  
		background-color: #FFFFFF;
		.top_view {  
		    height: var(--status-bar-height);  
		    width: 100%;  
		    position: fixed;  
		    background-color: #FFFFFF;  
		    top: 0;  
		    z-index: 999;  
		}
	}
	.header{
		width: 100%;
		height: 88upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* #ifdef MP-WEIXIN */
		justify-content: flex-start;
		/* #endif */
		position: fixed;
		top: 0;
		z-index: 10;
		background-color: #ffffff;
		/*  #ifdef  APP-PLUS|| MP-WEIXIN  */
		top: var(--status-bar-height);
		/*  #endif  */
	}
	.place {
		background-color: #ffffff;
		/*  #ifdef  APP-PLUS  */
		margin-top: var(--status-bar-height);
		/*  #endif  */
	}
</style>
