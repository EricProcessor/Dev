<template>
	<view class="otherCon">
		<view class="otherItem" v-for="(item,index) in otherList" :data-type="item.toLink" @click="routerTo($event)">
			<view class="otherItemLeft">
				<i class="leftSign" :class="item.leftIcon"></i>
				{{item.leftStr}}
			</view>
			<view class="otherItemRight">
				{{item.rightStr}}
				<i :class="item.rightIcon"></i>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				otherList: [{
					leftStr:'收藏夹',
					leftIcon:'leftSign01',
					rightStr:'收藏好的商品',
					rightIcon:'rightArrow',
					toLink:'pages/favorite/favorite'
				},{
					leftStr:'浏览历史',
					leftIcon:'leftSign02',
					rightStr:'最近逛的商品',
					rightIcon:'rightArrow',
					toLink:'/pages/history/history'
				},{
					leftStr:'我的消息',
					leftIcon:'leftSign03',
					rightStr:'查看消息',
					rightIcon:'rightArrow',
					toLink:'/pages/history/history'
				},{
					leftStr:'优惠券',
					leftIcon:'leftSign04',
					rightStr:'查看优惠券',
					rightIcon:'rightArrow',
					toLink:'/pages/history/history'
				},{
					leftStr:'收货地址',
					leftIcon:'leftSign05',
					rightStr:'管理收货地址',
					rightIcon:'rightArrow',
					toLink:'/pages/history/history'
				},{
					leftStr:'金融服务',
					leftIcon:'leftSign06',
					rightStr:'金融管理',
					rightIcon:'rightArrow',
					toLink:'/pages/history/history'
				}]
			};
		},
		methods:{
			routerTo:function (e){
				let type = e.currentTarget.dataset.type;
				uni.navigateTo({
					url: this.routerType[type],
					animationType: 'pop-in',
					animationDuration: 200
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.otherCon{
		margin-top: 20upx;
		border-top: 2upx solid #e2e7e9;
		background: #fff;
		box-sizing: border-box;
		color: #1a1a1a;
		font-size: 28upx;
		.otherItem{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-between;
			border-bottom: 2upx solid #e2e7e9;
			height: 90upx;
			box-sizing: border-box;
			.otherItemLeft,.otherItemRight{
				position: relative;
				line-height: 90upx;
				padding: 0 60upx 0 20upx;
				.leftSign{
					display: inline-block;
					width: 46upx;
					height: 46upx;
					margin-right: 10upx;
					background: url(/static/image/sg_buy.png) 0 0 no-repeat;
					background-size: 150upx auto;
					vertical-align: -12upx;
				}
				.rightArrow{
					background: url(../../../../static/image/sprites.png) no-repeat;
					background-size: 350upx auto;
					display: block;
					background-position: -200upx -100upx;
					width: 20upx;
					height: 32upx;
					position: absolute;
					top: 28upx;
					right: 20upx;
				}
				.leftSign02{background-position: -50upx 0;}
				.leftSign03{background-position: 0 -50upx;}
				.leftSign04{background-position: -50upx -50upx;}
				.leftSign05{background-position: -100upx 0;}
				.leftSign06{
					background: url(/static/image/repay_sprites.png) no-repeat;
					background-size: 90upx auto;
					background-position: 0 0;
				}
			}
			.otherItemLeft{
				
			}
		}
	}
</style>
