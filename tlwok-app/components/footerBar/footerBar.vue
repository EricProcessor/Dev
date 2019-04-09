<template>
	<view class="footer-bar">
		<view class="footer_item"
			v-for="(item,index) in footerList" 
			:data-type="index" 
			:class="[index == currentIndex ? 'itemActive' : '']"
			@tap="changeItems(index)">
			<image :src="index == currentIndex?item.pic_url:item.default_pic_url" mode=""></image>
			<view>{{item.title}}</view>
		</view>
	</view>
</template>

<script>
	export default{
		data (){
			return {
				currentIndex: 0,
				footerList: []
			}
		},
		methods:{
			changeItems: function (e){
				this.currentIndex = e;
				this.$emit('currentValue', this.currentIndex)
			}
		},
		mounted (){
			uni.request({
				url: '/api/indexfloor',
				method: 'GET',
				dataType: 'json',
				success: (res) => {
					if(res.data){
						let List = res.data.result.floors[14].data;
						this.footerList = List;
					}
				}
			});
		}
	}
</script>

<style scoped lang="scss">
	.footer-bar{
		position: fixed;
		bottom: 0;
		width: 100%;
		z-index: 999;
		margin: 0 auto;
		height: 100upx;
		background: #fff;
		border-top: 1upx solid #e2e7e9;
		overflow: hidden;
		box-sizing: border-box;
		.footer_item{
			float: left;
			width: ;
			text-align: center;
			text-align: center;
			font-size: 24upx;
			font-family: 'microsoft yahei';
			color: #506785;
			image {
				width: 46upx;
				height:46upx;
				margin: 10upx 0 4upx;
			}
		}
		.itemActive{
			color: #e4393c;
		}
	}
</style>
