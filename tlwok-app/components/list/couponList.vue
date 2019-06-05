<template>
	<view>
		<view class="list-cell">
			<view class="list-left" :class="index == 'noused' ? 'background1': 'background2'">
				<view class="left-top">¥<span>{{options.denomination}}</span></view>
				<view class="left-bottom">{{options.description}}</view>
			</view>
			<view class="list-right">
				<view class="couponImage" v-show="index != 'noused'">
					<image :src="index == 'used'?'/static/image/ysy.png':'/static/image/ygq.png'" mode=""></image>
				</view>
				<view class="right-top">
					<view class="name" 
					 :class="index != 'noused' ? 'font-disabled': ''">{{options.name}}</view>
					<view class="shopName">{{options.applicable_scope}}</view>
				</view>
				<view class="right-bottom" 
				 :class="index != 'noused' ? 'font-disabled': ''">有效期至：<span>{{options.effectiveStartTime}}-{{options.effectiveEndTime}}</span></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			options: {
				type: Object,
			},
			index:{
				type: String,
				required: true,
			}
    },
    onReady(){
      console.log(this.options)
    },
		methods: {
			
		}
	}
</script>

<style scoped lang="scss">
	view {
		.list-cell{
			display: flex;
			background: #ffffff;
			margin: 10px;
			border-radius: 10upx;
			overflow: hidden;
			.background1{
				background-image: url('../../static/image/bg_cp.png');
				background-size: 100% 200upx;
			}.background2{
				background-image: url('../../static/image/bg_cp2.png');
				background-size: 100% 200upx;
			}
			.list-left{
				width: 35%;
				text-align: center;
				color: #ffffff;
				.left-top{
					height:140upx;
					line-height: 140upx;
					span{
						font-size: 52upx;
					}
				}
				.left-bottom{
					font-size: 24upx;
					height:60upx;
					line-height: 60upx;
				}
			}
			.list-right{
				width: 65%;
				color: #666666;
				position: relative;
				.couponImage{
					position:absolute;
					top: 20upx;
					right: 20upx;
					image{
						width: 130upx;
						height: 100upx;
					}
					
				}
				.right-top{
					height:140upx;
					line-height: 140upx;
					padding-left: 20upx;
					.name{
						font-size: 30upx;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
					.shopName{
						padding-top: 10upx;
						font-size: 24upx;
						color: #a7a7a7;
					}
				}
				.right-bottom{
					font-size: 24upx;
					height:60upx;
					line-height: 60upx;
					text-align: center;
					span{
						color: #a7a7a7;
					}
				}
				.font-disabled{
					color: #a7a7a7!important;
				}
			}
			
		}
	}
</style>
