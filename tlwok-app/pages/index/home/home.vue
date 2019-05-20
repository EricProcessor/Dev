<template>
	<view class="content">
		<!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<view class="headerColor" :style="{opacity:options}"></view>
			<view class="iconCon">
				<view class="fl" @tap="toPages($event)" data-pages="/pages/category/category"><i class="tlwok-icon tlwicon-sort"></i><text>分类</text></view>
				<view class="searchIpt" @tap="toPages"><input type="text" value="" disabled="disabled"/></view>
				<view class="msg" @tap="toPages($event)" data-pages="/pages/message/message"><i class="tlwok-icon tlwicon-message"></i><text>消息</text></view>
			</view>
		</view>`
		<view class="place"></view>
		<!-- 自定义导航头结束 -->
		<view class="home">
			<!-- 轮播图 -->
			<view class="swiper">
				<view class="swiper-box">
					<swiper circular="true" autoplay="true" @change="swiperChange">
						<swiper-item v-for="(swiper) in swiperList" :key="swiper.index">
							<image :src="swiper.pic_url" @tap="toSwiper(swiper)"></image>
						</swiper-item>
					</swiper>
					<view class="indicator">
						<view
							class="dots"
							v-for="(swiper, index) in swiperList"
							:class="[currentSwiper == index ? 'on' : '']"
							:key="index"
						></view>
					</view>
				</view>
			</view>
			<!-- 分类导航 -->
			<view class="category">
				<view class="categoryItem" v-for="(item,index) in categoryList" :key="index" >
					<view class="imgCon">
						<image :src="item.pic_url" mode=""></image>
					</view>
					<view class="">{{item.title}}</view>
				</view>
			</view>
			<!-- 商品图 -->
			<view class="pic" v-for="(items,index) in picList" :key="index">
				<view class="picItem" v-for="(item,index0) in items.data" :key="index0"
					:style="[{width: items.width + '%'}]">
					<image :src="item.pic_url" mode=""></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				//轮播图
				swiperList:[],
				currentSwiper: 0,
				//分类导航
				categoryList:[],
				categoryWidth:0,
				//商品图
				picList:[]
			};
		},
		props: {
			options: {
				type: Number,
				default: true
			}
		},
		methods:{
			//头部跳转
			toPages:function (e){
				let url = e.target.dataset.pages;
				uni.navigateTo({
					url: url,
					animationType: 'pop-in',
					animationDuration: 200
				})
			},
			//轮播图跳转
			toSwiper(e) {
				uni.showToast({ title: e.src, icon: 'none' });
			},
			//轮播图指示器
			swiperChange(event) {
				this.currentSwiper = event.detail.current;
			}
		},
		mounted (){
			uni.request({
				url: this.$apiUrl+'/m/indexfloor',
				method: 'GET',
				dataType: 'json',
				success: (res) => {
					if(res.data.success){
						let result = JSON.parse(res.data.result)
						for(let i = 0; i < result.floors.length-1; i++){
							//轮播图
							result.floors[i].type == "banner_sys_module"?this.swiperList = result.floors[i].data:'';
							//分类导航
							if(result.floors[i].type == "icon_sys_module"){
								this.categoryList = result.floors[i].data;
							}
							//商品图
							if(result.floors[i].type == "pic_sys_module"){
								let picWidth = 100/Number(result.floors[i].col)
								result.floors[i].width = picWidth;
								this.picList.push(result.floors[i])
							}
						}
					}
				}
			});
		}
	}
</script>

<style scoped lang="scss">
	.content{
		height: 100%;
		//头部导航部分
		.header{
			background: transparent;
			color: #ffffff;
			.headerColor{
				background: #c91523;
				position: absolute;
				top: 0;
				width: 100%;
				height: 88upx;
				z-index: 11;
			}
			.iconCon{
				position: relative;
				z-index: 12;
				display: flex;
				justify-content: space-between;
				flex-wrap: nowrap;
				width: 100%;
				.fl,.msg{
					width: 80upx;
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					padding:0 10upx;
					font-size: 24upx; 	
					justify-content: center;
					i{
						font-size: 48upx;
					}
				}
				.searchIpt{
					width: 80%;
					display: flex;
					align-items: center;
					justify-content: center;
					input{
						width: 100%;
						height: 60upx;
						background: #ffffff;
						padding-left: 20upx;
						border-radius: 20upx;
					}
				}
			}
		}
		//内容部分
		.home{
			padding-bottom: 100upx;
			.swiper,.category,.pic{
				margin-bottom: 20upx;
			}
			.swiper {
				width: 100%;
				display: flex;
				justify-content: center;
				.swiper-box {
					width: 100%;
					height: 700upx;
					overflow: hidden;
					//兼容ios，微信小程序
					position: relative;
					z-index: 1;
					swiper {
						width: 100%;
						height: 700upx;
						swiper-item {
							image {
								width: 100%;
								height: 700upx;
							}
						}
					}
					.indicator {
						position: absolute;
						bottom: 20upx;
						left: 50%;
						width: 200upx;
						height: 20upx;
						margin-left: -100upx;
						border-radius: 3upx;
						overflow: hidden;
						display: flex;
						align-items: center;
						justify-content: center;
						.dots {
							width: 10upx;
							height: 10upx;
							border-radius: 50%;
							margin: 0 6upx;
							background-color: rgba(255, 255, 255, .4);
							&.on {
								background-color: rgba(0, 0, 0, 1);
							}
						}
					}
				}
			}
			.category{
				display: flex;
				justify-content: center;
				align-items: center;
				// items:4;
				background: #ffffff;
				.categoryItem{
					width: 25%;
					padding: 20upx 0;
					view{
						text-align: center;
						font-size: 24upx;
						color: #333333;
						image{
							width: 100upx;
							height: 100upx;
						}
					}
				}
			}
			.pic{
				display: flex;
				justify-content: flex-start;
				flex-wrap: wrap;
				.picItem{
					overflow: hidden;
					image{
						width: 100%;
						height: 240upx;
					}
				}
			}
		}
	}
</style>
