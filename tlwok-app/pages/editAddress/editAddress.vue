<template>
	<view>
		<form @submit="formSubmit">
			<view class="form-item">
				<view class="form-item-label">收货人</view>
				<input class="form-item-input" 
				 name="name" 
				 placeholder="请填写收货人姓名"
				 :value="addressInfo.name?addressInfo.name:''"/>
			</view>
			<view class="form-item">
				<view class="form-item-label">手机号码</view>
				<input class="form-item-input" 
				 name="telephone" 
				 placeholder="请填写手机号码"
				 :value="addressInfo.telephone?addressInfo.telephone:''"/>
			</view>
			<view class="form-item">
				<view class="form-item-label">所在地区</view>
				<view class="form-item-input" @tap="showMulLinkageThreePicker">
					{{addressInfo.pickerText?addressInfo.pickerText:'省市区县乡镇等'}}
				</view>
				<input style="display: none;" name="address" :value="addressInfo.pickerText?addressInfo.pickerText:''" />
			</view>
			<view class="form-item">
				<view class="form-item-label">详细地址</view>
				<input class="form-item-input" 
				 name="address" 
				 placeholder="街道楼牌号等"
				 :value="addressInfo.address?addressInfo.address:''"/>
			</view>
			<view class="form-btn">
				<button class="submitAddress" formType="submit">保存</button>
			</view>
		</form>
		<mpvue-city-picker 
		 :themeColor="themeColor" ref="mpvueCityPicker" 
		 :pickerValueDefault="addressInfo.cityPickerValueDefault"
		 @onCancel="onCancel" @onConfirm="onConfirm"></mpvue-city-picker>
	</view>
</template>

<script>
	import mpvueCityPicker from '@/components/mpvue-citypicker/mpvueCityPicker.vue'
	export default {
		components:{
			mpvueCityPicker
		},
		data() {
			return {
				pickerText:'',
				themeColor: '#007AFF',
				addressInfo:{
					name:'',
					telephone:'',
					pickerText:'',
					address:'',
					cityPickerValueDefault:[0, 0, 1]
				}
			};
		},
		methods:{
			onCancel(e) {
				console.log('取消选择地区')
			},
			onConfirm(e) {
				//this.pickerText = JSON.stringify(e)
				console.log(e.label)
				console.log(e.value)
				this.addressInfo.pickerText = e.label;
				this.addressInfo.cityPickerValueDefault = e.value;
			},
			// 三级联动选择
			showMulLinkageThreePicker() {
				this.$refs.mpvueCityPicker.show()
			},
			formSubmit:function (){
				console.log('form发生了submit事件，携带数据为：' + JSON.stringify(e.detail.value))
			}
		},
		onLoad(option) {
			let address = option.addressId?option.addressId:'';
			if(address){
				uni.setNavigationBarTitle({
					title: '编辑收货地址'
				});
			}else{
				uni.setNavigationBarTitle({
					title: '新增收货地址'
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	form{
		.form-item{
			margin: 0 20upx;
			height: 100upx;
			display: flex;
			justify-content: flex-start;
			box-sizing: border-box;
			color: #666;
			border-bottom: 1upx solid #e2e7e9;
			.form-item-label,.form-item-input{
				padding: 0 20upx;
				display: inline-block;
				height: 100upx;
				line-height: 100upx;
				min-width: 150upx;
			}
			.form-item-input{
				width: 100%;
			}
		}
		.form-btn{
			position: fixed;
			bottom: 10upx;
			width: 100%;
			height: 80upx;
			.submitAddress{
				width: 500upx;
				height: 80upx;
				line-height: 80upx;
				background: #e4393c;
				margin: 0 auto;
				border-radius: 50upx;
				color: #fff;
			}
		}
	}
	
</style>
