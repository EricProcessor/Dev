<template>
	<view>
		<view class="addressItem" v-for="items in addressList" :key="items.index">
			<view class="addressTop">
				<view class="itemInfo">
					<view class="">{{items.contactPerson}}</view>
					<view class="">{{items.contactPhone}}</view>
				</view>
				<view class="itemAddress">{{items.fullAddress}}</view>
			</view>
			<view class="addressBottom">
				<view>
					<label class="radio" @tap="checkOther">
						<radio value="" style="transform:scale(0.8)" :checked="items.isDefault" color="#e4393c"/>设为默认地址
					</label>
				</view>
				<view class="addressBtn">
					<span @tap="toEditAddress(items.id)"><i class="tlwok-icon tlwicon-edit"></i>编辑</span>
					<span @tap="deteleAddress(items.id)"><i class="tlwok-icon tlwicon-delete"></i>删除</span>
				</view>
			</view>
		</view>
		<view class="btnCon">
			<view class="address" @tap="toEditAddress('')">
				<span><i class="tlwok-icon tlwicon-add"></i>新建收货地址</span>
			</view>	
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				addressList:[{
					contactPerson:"孙隐",
					contactPhone:"13825604652",
					fullAddress:"广东省 珠海市 香洲区 人民东路125",
					id:1002041,
					isDefault:false
				},{
					contactPerson:"测试订单",
					contactPhone:"13825604652",
					fullAddress:"广东省 珠海市 香洲区 人民东路125号18楼",
					id:1002042,
					isDefault:true
				}]
			};
		},
		methods:{
			toEditAddress:function (index){
				let addressId = index?index:'';
				uni.navigateTo({
					url: '/pages/editAddress/editAddress?addressId='+addressId+''
				});
				
			},
			checkOther(){
				let isCheck = true
				this.addressList.forEach(item=>{
					if(!item.isDefault){
						item.isDefault = isCheck
					}else{
						item.isDefault = false
					}
				})
			},
			deteleAddress(addrId){
				let addressId = addrId || ''
				console.log('删除....')
			}
		}
	}
</script>

<style scoped lang="scss">
	.addressItem{
		background: #fff;
		padding: 20upx;
		margin: 20upx 0;
		overflow: hidden;
		.addressTop{
			border-bottom: 2upx solid #e2e7e9;
			padding-bottom: 20upx;
			box-sizing: border-box;
			color:#666;
			.itemInfo{
				display: flex;
				justify-content: space-between;
				font-size: 30upx;
			}
			.itemAddress{
				margin-top: 10upx;
				font-size: 24upx;
			}
		}
		.addressBottom{
			padding: 20upx 0;
			display: flex;
			justify-content: space-between;
			color: #666;
			.addressBtn{
				span{
					display: inline-block;
					margin: 0 20upx;
					i{
						display: inline-block;
						margin-right: 10upx;
					}
				}
			}
		}
		
	}
	.btnCon{
		width: 100%;
		color: #fff;
		text-align: center;
		position: fixed;
		bottom: 10upx;
		.address{
			width: 500upx;
			height: 80upx;
			line-height: 80upx;
			background: #e4393c;
			margin: 0 auto;
			border-radius: 50upx;
			i{
				display: inline-block;
			}
		}
	}
</style>
