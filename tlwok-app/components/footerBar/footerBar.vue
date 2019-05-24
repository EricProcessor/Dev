<template>
	<view class="footer-bar">
		<view class="footer_item"
			v-for="(item,index) in footerList" :key="index"
			:data-type="index" 
			:class="[index == currentIndex ? 'itemActive' : '']"
			:style="'width:'+width+'%'"
			@tap="changeItems($event)">
			<image :src="index == currentIndex?item.pic_url:item.default_pic_url" mode=""></image>
			<view>{{item.title}}</view>
		</view>
	</view>
</template>

<script>
	export default{
		props:{
			footerList:{
				type:Array
			},
			width:{
				type:Number
			}
		},
		data (){
			return {
				currentIndex: 0,
			}
		},
		methods:{
			changeItems: function (e){
				this.currentIndex = e.currentTarget.dataset.type;
				this.$emit('currentValue', this.currentIndex)
			}
		},
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
			text-align: center;
			text-align: center;
			font-size: 24upx;
			font-family: 'microsoft yahei';
			color: #506785;
			image {
				width: 46upx;
				height:46upx;
				margin-top: 10upx;
			}
		}
		.itemActive{
			color: #e4393c;
		}
	}
</style>
