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
</style>
