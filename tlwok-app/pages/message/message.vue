<template>
	<view>
		<view class="msgList" v-for="item in list">
			<view>
				<view class="msgTime">{{item.time}}</view>
			</view>
			<view class="msgInfo">
				<view class="msgTitle">
					{{item.title}}
				</view>
				<view class="msgText">
					{{item.text}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				type:'',
				messageList:{
					buyer:[{
						time:'2019.03.11 12:11',
						title:'买家消息',
						text:'〖订单变更提醒〗尊敬的顾客您好，您的订单2668409出现金额变更，当前订单金额为0.01, 请确认后再进行支付！'
					},{
						time:'2019.03.10 13:11',
						title:'买家消息',
						text:'欢迎在 天章集团预发布系统购物，您的订单【2668239】，已经发货'
					}],
					seller:[{
						time:'2019.03.11 12:11',
						title:'卖家消息',
						text:'〖订单变更提醒〗尊敬的顾客您好，您的订单2668409出现金额变更，当前订单金额为0.01, 请确认后再进行支付！'
					},{
						time:'2019.03.10 13:11',
						title:'卖家消息',
						text:'欢迎在 天章集团预发布系统购物，您的订单【2668239】，已经发货'
					}]
				},
				list:[]
			};
		},
		onLoad(option) {
			let type = option.msg?option.msg:'buyer';
			this.list = this.messageList[type];
		}
	}
</script>

<style scoped lang="scss">
	.msgList{
		padding: 20upx;
		.msgTime{
			width: 400upx;
			margin: 0 auto;
			text-align: center;
			background: #ccc;
			color: #fff;
			border-radius: 60upx;
			overflow: hidden;
		}
		.msgInfo{
			background: #fff;
			margin-top: 30upx;
			padding: 20upx;
			.msgText{
				width: 100%;
				line-height: 36upx;
				font-size: 28upx;
				-o-text-overflow: ellipsis;
				text-overflow: ellipsis;
				-webkit-line-clamp: 2;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				overflow: hidden;
				font-weight: normal;
				color: #999;
			}
		}
	}
</style>
