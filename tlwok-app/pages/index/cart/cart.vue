<template>
	<view>
		<!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view>  
		<view class="header">
			<view style="margin:0 auto;font-size: 32upx;font-weight: 700;">
				购物车
			</view>
		</view>
		<view class="place"></view>
		<!-- 自定义导航头结束 -->
		<!-- 商品列表 -->
		<view class="cart-list" style="padding-bottom: 200upx;">
			<template v-if="goodsList.length <= 0">
				<view class="noList">
					<view class="icon">
						<i class="tlwok-icon">&#xe6af</i>
					</view>
					<view class="text">
						<view>您的购物车内还没有商品，赶紧挑一下中意的商品吧~</view>
					</view>
				</view>
			</template>
			<template v-else>
				<view class="shopList" v-for="(shopList,index) in goodsList" :key="index">
					<!-- 商铺title -->
					<view>
						<!-- 商铺checkbox -->
						<view class="shopTitle" @tap="toShop(shopList.shopId)">
							<view class="titleLeft">
								<view class="checkbox-box" @tap="shopSelected(index)">
									<view class="checkbox">
										<view :class="[shopList.selected?'on':'']"></view>
									</view>
								</view>
								<i class="tlwok-icon">&#xe676</i>
								<view class="shopName">{{shopList.shopName}}</view>
							</view>
							<view>
								<i class="tlwok-icon" style="">&#xe6a3</i>
							</view>
						</view>
						<!-- 商品title -->
						<view class="goodsItem" v-for="(item,index1) in shopList.goods" :key="index1" >
							<!-- 删除按钮 -->
							<view class="menu" @tap.stop="deleteGoods(item.id)">
								<i class="tlwok-icon shanchu">&#xe6b4</i>
							</view>
							<!-- 商品 -->
							<view class="carrier" 
							 :class="[theIndex==item.id?'open':oldIndex==item.id?'close':'']" 
							 @touchstart="touchStart(item.id,$event)" 
							 @touchmove="touchMove(item.id,$event)" 
							 @touchend="touchEnd(item.id,$event)">
								<!-- checkbox -->
								<view class="checkbox-box" @tap="goodsSelected(index,index1)">
									<view class="checkbox">
										<view :class="[item.selected?'on':'']"></view>
									</view>
								</view>
								<!-- 商品信息 -->
								<view class="goods-info" @tap="toGoods(item)">
									<view class="img">
										<image :src="item.img"></image>
									</view>
									<view class="info">
										<view class="title">{{item.name}}</view>
										<view class="spec">{{item.spec}}</view>
										<view class="price-number">
											<view class="price">￥{{item.price}}</view>
											<view class="number">
												<view class="sub" @tap.stop="sub(index,index1)">
													<view class="icon jian"></view>
												</view>
												<view class="input" @tap.stop="discard">
													<input disabled="true" type="number" v-model="item.number" @input="sum" />
												</view>
												<view class="add"  @tap.stop="add(index,index1)">
													<view class="icon jia"></view>
												</view>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<!-- 脚部菜单 -->
				<view class="footer" :style="{bottom:footerbottom}">
					<view class="checkbox-box" @tap="allSelect">
						<view class="checkbox">
							<view :class="[isAllselected?'on':'']"></view>
						</view>
						<view class="text">全选</view>
					</view>
					<!-- <view class="delBtn" @tap="deleteList" v-if="selectedList.length>0">删除</view> -->
					<view class="settlement">
						<view class="sum">合计:<view class="money">￥{{sumPrice}}</view></view>
						<view class="btn" @tap="toConfirmation">结算({{selectedList.length}})</view>
					</view>
				</view>
			</template>
        </view>
	</view>
</template>

<script>

	export default {
		data() {
			return {
				sumPrice:'0.00',
				headerPosition:"fixed",
				headerTop:null,
				statusTop:null,
				selectedList:[],
				isShopselected:false,
				isAllselected:false,
				goodsList:[{
					shopName:"乐活文具",
					shopId:12213,
					selected:false,
					goods:[{
						id:1,
						img:'http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg',
						name:'得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱',
						spec:["颜 色:黑色","单位:包"],
						price:12123.5,number:1,selected:false
					},{
						id:2,
						img:'http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg',
						name:'得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱',
						spec:["颜 色:黑色","单位:包"],
						price:127.5,number:1,selected:false
					}]
				},{
					shopName:"乐活文具",
					selected:false,
					shopId:124435,
					goods:[{
						id:3,
						img:'http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg',
						name:'得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱',
						spec:["颜 色:黑色","单位:包"],
						price:12123.5,number:1,selected:false
					},{
						id:4,
						img:'http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg',
						name:'得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱',
						spec:["颜 色:黑色","单位:包"],
						price:127.5,number:1,selected:false
					}]
				},{
					shopName:"乐活文具",
					shopId:1213,
					selected:false,
					goods:[{
						id:5,
						img:'http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg',
						name:'得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱',
						spec:["颜 色:黑色","单位:包"],
						price:12123.5,number:1,selected:false
					},{
						id:6,
						img:'http://img-b2b.jcloudcs.com/2430f2d4-2d52-4de1-9ce4-e9bf408ed019.jpg',
						name:'得力9874快干清洁印泥油(红/蓝/黑)(瓶)印台印油财务用品印章油12瓶/包,144瓶/箱',
						spec:["颜 色:黑色","单位:包"],
						price:127.5,number:1,selected:false
					}]
				}],
				//控制滑动效果
				theIndex:null,
				oldIndex:null,
				isStop:false,
				footerbottom:'50px'
			}
		},
		onPageScroll(e){
			//兼容iOS端下拉时顶部漂移
			this.headerPosition = e.scrollTop>=0?"fixed":"absolute";
			this.headerTop = e.scrollTop>=0?null:0;
			this.statusTop = e.scrollTop>=0?null:-this.statusHeight+'px';
		},
		//下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
		onPullDownRefresh() {
		    setTimeout(function () {
		        uni.stopPullDownRefresh();
		    }, 1000);
		},
		onLoad() {
			//兼容H5下结算条位置
			// #ifdef H5
				this.footerbottom = 50+'px';
			// #endif
			// #ifdef APP-PLUS
			this.statusHeight = plus.navigator.getStatusbarHeight();
			// #endif
		},
		methods: {
			//控制左滑删除效果-begin
			touchStart(index,event){
				//多点触控不触发
				if(event.touches.length>1){
					this.isStop = true;
					return ;
				}
				this.oldIndex = this.theIndex;
				this.theIndex = null;
				//初始坐标
				this.initXY = [event.touches[0].pageX,event.touches[0].pageY];
			},
			touchMove(index,event){
				//多点触控不触发
				if(event.touches.length>1){
					this.isStop = true;
					return ;
				}
				let moveX = event.touches[0].pageX - this.initXY[0];
				let moveY = event.touches[0].pageY - this.initXY[1];
				
				if(this.isStop||Math.abs(moveX)<5){
					return ;
				}
				if (Math.abs(moveY) > Math.abs(moveX)){
					// 竖向滑动-不触发左滑效果
					this.isStop = true;
					return;
				}
				
				if(moveX<0){
					this.theIndex = index;
					this.isStop = true;
				}else if(moveX>0){
					if(this.theIndex!=null&&this.oldIndex==this.theIndex){
						this.oldIndex = index;
						this.theIndex = null;
						this.isStop = true;
						setTimeout(()=>{
							this.oldIndex = null;
						},150)
					}
				}
			},
			touchEnd(index,$event){
				//结束禁止触发效果
				this.isStop = false;
			},
			//控制左滑删除效果-end
			
			//店铺跳转
			toShop:function (shopId){
				uni.navigateTo({
					url: "/pages/shop/shop?shopId="+shopId,
					animationType: 'pop-in',
					animationDuration: 200
				});
			},
			//商品跳转
			toGoods(e){
				uni.showToast({title: '商品'+e.id,icon:"none"});
				uni.navigateTo({
					url: '../goods/goods' 
				});
			},
			//跳转确认订单页面
			toConfirmation(){
				let tmpList=[];
				let len = this.goodsList.length;
				for(let i=0;i<len;i++){
					if(this.goodsList[i].selected) {
						tmpList.push(this.goodsList[i]);
					}
				}
				if(tmpList.length<1){
					uni.showToast({
						title:'请选择商品结算',
						icon:'none'
					});
					return ;
				}
				uni.setStorage({
					key:'buylist',
					data:tmpList,
					success: () => {
						uni.navigateTo({
							url:'../order/confirmation'
						})
					}
				})
			},
			//删除商品
			deleteGoods(id){
				let len = this.goodsList.length;
				for(let i=0;i<len;i++){
					if(id==this.goodsList[i].id){
						this.goodsList.splice(i, 1);
						break;
					}
				}
				this.sum();
				this.oldIndex = null;
				this.theIndex = null;
			},
			// 删除商品s
			deleteList(){
				let len = this.selectedList.length;
				for(let i=0;i<len;i++){
					this.deleteGoods(this.selectedList[i]);
				}
				this.selectedList = [];
				this.isAllselected = this.selectedList.length == this.goodsList.length && this.goodsList.length>0;
				this.sum();
			},
			//获取全部商品数量
			getGoodsNum:function (){
				let goodsNum = 0;
				for(let k = 0; k < this.goodsList.length;k++){
					goodsNum += this.goodsList[k].goods.length
				}
				return goodsNum
			},
			// 选中店铺
			shopSelected(index){
				let item = this.goodsList[index];
				item.selected = item.selected?false:true;
				for(let j = 0; j < item.goods.length; j++){
					item.goods[j].selected = item.selected?true:false;
					let i = this.selectedList.indexOf(item.goods[j].id);
					if(i>-1){this.selectedList.splice(i, 1)}
					if(item.goods[j].selected){this.selectedList.push(item.goods[j].id)}
				}
				this.isAllselected = this.selectedList.length == this.getGoodsNum()?true:false;
				this.sum();
			},
			// 选中商品
			goodsSelected(index,index1){
				let item = this.goodsList[index].goods[index1];
				item.selected = item.selected?false:true;
				let i = this.selectedList.indexOf(item.id);
				i>-1?this.selectedList.splice(i, 1):this.selectedList.push(item.id);
				//所有商品被选中--全选按钮被选中
				this.isAllselected = this.selectedList.length == this.getGoodsNum()?true:false;
				//选中店铺内所有商品-店铺相应被选中
				for(let j=0;j<this.goodsList[index].goods.length;j++){
					if(!this.goodsList[index].goods[j].selected){
						this.goodsList[index].selected = false;
						break;
					}else{
						this.goodsList[index].selected = true;
					}
				}
				this.sum();
			},
			//全选
			allSelect(){
				let arr = [];
				let list = this.goodsList;
				for(let i=0;i<list.length;i++){
					list[i].selected = this.isAllselected? false : true;
					for(let j=0; j<list[i].goods.length;j++){
						list[i].goods[j].selected = this.isAllselected? false : true;
						arr.push(list[i].goods[j].id);
					}
				}
				this.selectedList = this.isAllselected?[]:arr;
				this.isAllselected = this.isAllselected||list.length==0?false : true;
				this.sum();
			},
			// 减少数量
			sub(index,index1){
				if(this.goodsList[index].goods[index1].number<=1){
					return;
				}
				this.goodsList[index].goods[index1].number--;
				this.sum();
			},
			// 增加数量
			add(index,index1){
				this.goodsList[index].goods[index1].number++;
				this.sum();
			},
			// 合计
			sum(){
				this.sumPrice=0;
				for(let j=0;j< this.goodsList.length;j++){
					for(let k=0;k<this.goodsList[j].goods.length;k++){
						if(this.goodsList[j].goods[k].selected){
							this.sumPrice = this.sumPrice + (this.goodsList[j].goods[k].number*this.goodsList[j].goods[k].price);
						}
					}
				}
				this.sumPrice = this.sumPrice.toFixed(2);
			},
			discard() {
				//丢弃
			}
			
			
		}
	}
</script>
<style lang="scss">
	page{position: relative;}
	@font-face {font-family:"HMfont-home";src:url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAOEAAsAAAAAB7wAAAM1AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDHAqDAIJNATYCJAMQCwoABCAFhG0HPhu1BsiOw7jha84s8T+CgOyq6unevTlAeAkRhAhQBjj8eJfmMg/oB5whSgaFspy7AqbpwE3Py3/j9j+X07uGyFHr21lua9HYi9rUCzDeGtBYmw4o0AJJ0BvGLmiJxyEAC3yIQhSVPL9BF4U5TgBi7ChtQzfjQKFYWEdgrFiqEBsxoGurtMfAhuD74g8JQgcNg8ScWjf8xoPz7/nfD8iFpoV0eQi86XQAWwUSiAIUiJGVhgEaUSAKiYXau0kKoKOjwVRthd8PmExIBRvmWH95INCQIIyYqVYAJKGghO/5Dg4B3wtxaPD9QAoS4IOM1gEzYBbAMkT16iIQGPxsopS5ScAcK23LiaBDpzyk1aGLHtsvhVrL7adDD55016wPXnDfcr7T3lcE2TVcP2fNhZM7WeiEhVp44vx9C5vVD6+eEgaLTZvEot3HL1lawlnXLK3XnISDllbWwmrmGjlRLdxq2bpme1RAeqXtzWh6g0F//wCCnRiN2diwr2+Yse3iEs20g05Q5tT0BikOXwKf79vsoEvb6p6xjVhHP92nwDJmX+9hwsf26dXbPiNvZ/98x67/+5T+ev0aWxbXCwOX41zLxia+O73B6Y57fN1u6GvN+Zmbc8XITigTAcB0Rl6X8QB4hDgEpoXypZz2q37D5FVnVa9t1n/dUgHw8uKMq9BmWqjoJoP3zevM+zG8jmVKE5hKpRShw9WTFZW04D7TscAC+B0RcOD9FHLnzqkg0HFOQMMMb5DoBKGKGgUGLEkCIzq5YEEkpastcWQyDYQyByJYBkBgx2nQsOEaSOx4girqOzDgwj8wYickWNAiHLe0JESMsiicTLaQh84PBm6WKlst/TD9hXQV25wWBLQP4jJw435MXD58RynxFDPKT30golBxluAtOI3iOMOcs5Bc2fFF8sPd2OFVBO24WQJ9CmEIG4HwQAb4ARmFS0aK8qoL/cLnXyA0FTE23FBSZf+AYEqCzpF4YojrgN5J004lt/LKFD7RHDAVQYEMh8lIQErAICImJgOZWD0ohHARdhg5wJdzSKxVaXhX6c7y8uQN1wAWmLOU0IQUShiQo0fZTceadqaMdP2uXwEAAAAA') format('woff2');}
	.icon {
		font-family:"HMfont-home" !important;
		font-size:60upx;
		font-style:normal;
		color:#000000;
		&.jia {
			&:before{content:"\e641";}
		}
		&.jian {
			&:before{content:"\e643";}
		}
		&.shanchu {
			&:before{content:"\e6a4";}
		}
		
	}
	.checkbox-box{
		display: flex;
		align-items: center;
		.checkbox{
			width: 30upx;
			height: 30upx;
			border-radius: 100%;
			border: solid 2upx #e4393c;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			.on{
				width: 14upx;
				height: 14upx;
				border-radius: 100%;
				background-color: #e4393c;
			}
		}
		.text{
			font-size: 28upx;
			margin-left: 10upx;
		}
	}
	.cart-list{
		width: 100%;
		margin-top:88upx; 
		/*  #ifdef  APP-PLUS */
		margin-top: var(--status-bar-height);
		/*  #endif  */
		.shopList{
			.shopTitle{
				display: flex;
				justify-content: space-between;
				padding: 0 20upx;
				i{
					height: 80upx;
					line-height: 80upx;
					display: inline-block;
					margin-left:20upx;
				}
				.titleLeft{
					display: flex;
					justify-content: flex-start;
					.shopName{
						font-size: 32upx;
						height: 80upx;
						line-height: 80upx;
						margin-left: 10upx;
					}
				}
			}
			.goodsItem{
				width: calc(92%);
				height: calc(22vw + 40upx); 
				margin: 20upx auto;
				border-radius: 15upx;
				box-shadow: 0upx 5upx 20upx rgba(0,0,0,0.1);
				display: flex;
				align-items: center;
				position: relative;
				overflow: hidden;
				z-index: 4;
				border: 0;
				.menu{
					position: absolute;
					width: 30%;
					height: 99%;
					right: 1upx;
					display: flex;
					justify-content: center;
					align-items: center;
					color: #fff;
					z-index: 2;
					background: #e4393c;
					.shanchu{
						color: #fff;
						font-size: 52upx;
					}
				}
				.carrier{
					@keyframes showMenu {
						0% {transform: translateX(0);}100% {transform: translateX(-30%);}
					}
					@keyframes closeMenu {
						0% {transform: translateX(-30%);}100% {transform: translateX(0);}
					}
					&.open{
						animation: showMenu 0.25s linear both;
					}
					&.close{
						animation: closeMenu 0.15s linear both;
					}
					background-color: #fff;
					.checkbox-box{
						padding:0 20upx;
						flex-shrink: 0;
						height: 22vw;
					}
					position: absolute;
					width: 100%;
					padding: 0 0;
					height: 100%;
					z-index: 3;
					display: flex;
					align-items: center;
				
					.goods-info{
						width: 100%;
						display: flex;
						padding-right: 20upx;
						.img{
							width: 22vw;
							height: 22vw;
							border-radius: 10upx;
							overflow: hidden;
							flex-shrink: 0;
							margin-right: 10upx;
							image{
								width: 22vw;
								height: 22vw;
							}
						}
						.info{
							width: 100%;
							overflow: hidden;
							display: flex;
							flex-wrap: wrap;
							position: relative;
							.title{
								height: 74upx;
								line-height: 36upx;
								font-size: 28upx;
								-o-text-overflow: ellipsis;
								text-overflow: ellipsis;
								-webkit-line-clamp: 2;
								display: -webkit-box;
								-webkit-box-orient: vertical;
								overflow: hidden;
								font-weight: normal;
								color: #1e1e1e;
								text-overflow: ellipsis;
								-webkit-line-clamp: 2;
							}
							.spec{
								font-size: 20upx;
								background-color: #f3f3f3;
								color: #a7a7a7;
								height: 30upx;
								line-height: 30upx;
								display: flex;
								align-items: center;
								padding: 0 10upx;
								margin: 10upx 0;
							}
							.price-number{
								width: 100%;
								display: flex;
								justify-content: space-between;
								align-items: flex-end;
								font-size: 28upx;
								height: 60upx;
								.price{
									line-height: 70upx;
									color: #e4393c;
									font-size: 32upx;
								}
								.number{
									display: flex;
									justify-content: center;
									align-items: flex-end;
									.input{
										width: 60upx;
										height: 60upx;
										margin: 0 10upx;
										background-color: #f3f3f3;
										input{
											width: 60upx;
											height: 60upx;
											display: flex;
											justify-content: center;
											align-items: center;
											text-align: center;
											font-size: 26upx;
										}
									}
									.sub ,.add{
										width: 45upx;
										height: 45upx;
										background-color: #f3f3f3;
										border-radius: 5upx;
										.icon{
											font-size: 22upx;
											width: 45upx;
											height: 45upx;
											display: flex;
											justify-content: center;
											align-items: center;
											
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	.footer{
		width: 100%;
		padding: 0 4%;
		background-color: #fbfbfb;
		height: 100upx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28upx;
		position: fixed;
		bottom: 0upx;
		z-index: 5;
		.delBtn{
			border: solid 1upx #f06c7a;
			color: #f06c7a;
			padding: 0 30upx;
			height: 50upx;
			border-radius: 30upx;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.settlement{
			width: 80%;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			.sum{
				min-width: 200upx;
				font-size: 28upx;
				margin-right: 10upx;
				display: flex;
				justify-content: flex-end;
				.money{
					font-weight: 600;
				}
			}
			.btn{
				min-width: 160upx;
				padding: 0 30upx;
				height: 100upx;
				background-color: #e4393c;
				color: #fff;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
</style>
