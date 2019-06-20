<template>
	<view>
		<view class="footer">
			<view class="icons">
				<view class="box">
					<view class="boxIcon tlwok-icon tlwicon-cart"></view>
					<view class="text">进货车</view>
          <span class="proNum">0</span>
				</view>
				<view class="box" @tap="keep">
					<view class="boxIcon tlwok-icon" :class="[isKeep?'tlwicon-likefill':'tlwicon-like']"></view>
					<view class="text">{{isKeep?'已':''}}收藏</view>
				</view>
			</view>
			<view class="btn">
				<view class="joinCart" @tap="joinCart">加入购物车</view>
				<view class="buy" @tap="buy">立即购买</view>
			</view>
		</view>
		<!-- 规格-模态层弹窗 -->
		<view class="popup spec" :class="specClass" @touchmove.stop.prevent="discard" @tap="hideSpec">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="layer shadowInfo" @tap.stop="discard">
				<view class="content">
          <view class="proAbout">
            <view class="image">
              <image mode="aspectFit" :src="skuPro.pictureUrl"></image>
            </view>
            <view class="skuProName">
              <view class="name">
                <span class="isSelf" v-if="shop.shopType">自营</span>乐活天章龙复印纸70g/A3
              </view>
              <view class="price">¥{{skuPrice}}</view>
            </view>
          </view>
 
					<view class="title">选择规格：</view>
					<view class="sp">
						<view v-for="(item,index) in norms"  @tap="setSelectSpec(index,item.skuId)" :key="index">
             <view class="normsSty" :class="[index==selectSpec?'on':'']">{{item.attrName}} {{item.attrValueName}}</view>
            </view>
					</view>
					<view class="length" v-if="selectSpec!=null">
						<view class="lenCount">
              <view class="text">数量</view>
              <view class="number">
                <view class="sub" @tap="sub">
                  <view class="icon jian">－</view>
                </view>
                <view class="input" @tap="discard">
                  <input type="number"  v-model="maskInfo.lastCount"/>
                </view>
                <view class="add"  @tap="add">
                  <view class="icon jia">＋</view>
                </view>
              </view>
            </view>
            <view class="stockCount" v-if="skuPro.inventory!=0">库存 {{skuPro.inventory}}</view>
            <view class="stockCount" v-else>无库存</view>
					</view>
				</view>
        <view class="computedPrice">
          <view class="count">共 {{maskInfo.typeCount}} 种</view>
          <view class="count">共 {{maskInfo.maskCount}} 件</view>
          <view class="price">¥ {{maskInfo.maskPrice}}</view>
        </view>
				<view class="btn">
          <view class="button addCart" @tap="hideSpec">加入购物车</view>
          <view class="button buyNow" @tap="hideSpec">立即购买</view>
        </view>
			</view>
		</view>
		<!-- 商品主图轮播 -->
		<view class="swiper-box">
			<swiper @change="swiperChange">
				<swiper-item v-for="(swiper,i) in swiperList" :key="i">
					<image :src="swiper" @tap="toSwiper(swiper)"></image>
				</swiper-item>
			</swiper>
      <view class="curImg" v-if="swiperList.length!=0">{{currentSwiper}}/{{swiperList.length}}</view>
		</view>
		<!-- 标题 价格 -->
		<view class="info-box goods-info">
			<view class="title">
        <span v-if="shop.shopType">自营</span>
				{{goodsData.itemName}}
			</view>
      <view class="priceBox">
        <view class="price">
          <span>￥{{skuPrice}}</span>
        </view>
        <view class="sellCount">已售 <span>{{saleCount}}</span>件</view>
      </view>
      <view class="logisticsBox">
        <view class="log-item">
          运费<span>{{isFare?'包邮':'买家支付运费'}}</span>
        </view>
        <view class="log-item">
          成交<span>{{saleCount}}</span>笔
        </view>
        <view class="log-item log-city">{{shopAddr}}</view>
      </view>
		</view>
		<!-- 选择  地址 -->
		<view class="info-box spec">
      <view class="row choose" @tap="showSpec(false)">
				<view class="text selectText">选择</view>
				<view class="content">
					<view class="sp">{{normsStr}}</view>					
				</view>
				<view class="arrow"><view class="tlwok-icon tlwicon-right"></view></view>
			</view>
			<view class="row" @tap="showAddr">
				<view class="text">配送至</view>
        <span class="log-addr addr">{{address}}</span>
        <span class="log-addr addrItem tlwok-icon tlwicon-location"></span>
        <span class="log-addr addrScope">{{isScope?'现货':'(该区域不在配送范围内)'}}</span>
			</view>
		</view>
    <!-- 图文 评价 -->
    <view class="info-box imgEvaluate">
      <view class="imgTextDetail">
        <view class="imgtitle">图文详情</view>
        <view class="rightIcon tlwok-icon tlwicon-right"></view>
      </view>
      <view class="evaluate">
        <view class="evaTitle">评价</view>
        <view class="evaRate">
          <view class="evaCount">0 人评价</view>
          <view class="rate" v-if="evaCount!=0">
            <uni-rate @change="onChange" :value="evaCount" color="#bbb" active-color="red"></uni-rate>
            <span>{{evaCount}} 分</span>
          </view>
          <view class="rate" v-if="evaCount==0">暂无评分</view>
        </view>
      </view>
    </view>
    <!-- 商铺 -->
    <view class="info-box curShop">
      <view class="shopInfo">
        <view class="shopName">
          <image class="logo" :src="shop.shopLogoUrl"></image>
          <view class="cityName">
            <view class="cityCol">
              {{shop.shopName}}
              <span v-if="shop.shopType">自营</span>
            </view>
            <view class="city">{{shop.shopName}}</view>
          </view>
        </view>
        <view class="rightIcon tlwok-icon tlwicon-right"></view>
      </view>
      <view class="selectTab">
        <view class="allPro" @tap="allProduct">
          <view class="tlwok-icon tlwicon-list"></view>
          <view class="allText">全部货品</view>
        </view>
        <view class="newPeo" @tap="newProduct">
          <view class="tlwok-icon tlwicon-shop"></view>
          <view class="allText">店铺上新</view>
        </view>
      </view>
    </view>
		<!-- 评价 -->
		<view class="info-box comments" id="comments">
			<view class="row">
				<view class="text">商品评价(0)</view>
				<view class="arrow">
					<view class="show" @tap="showComments(goodsData.id)">
						查看全部
						<view class="icon xiangyou"></view>
					</view>
				</view>
			</view>
			<!-- <view class="comment">
				<view class="user-info">
					<view class="face"><image :src="goodsData.comment.userface"></image></view>
					<view class="username">{{goodsData.comment.username}}</view>
				</view>
				<view class="content">
					{{goodsData.comment.content}}
				</view>
			</view> -->
		</view>
		<!-- 详情 -->
		<view class="description">
			<view class="title">———— 商品详情 ————</view>
			<view class="content"><rich-text :nodes="descriptionStr"></rich-text></view>
		</view>



    <mpvue-city-picker
      :themeColor="themeColor"
      ref="mpvueCityPicker"
      :pickerValueDefault="cityDefault"
      @onCancel="onCancel"
      @onConfirm="onConfirm"
    ></mpvue-city-picker>
	</view>
</template>

<script>
import mpvueCityPicker from '@/components/mpvue-citypicker/mpvueCityPicker.vue'
import cityData from '@/utils/city.data.js'
import uniRate from '@/components/uni-rate/uni-rate.vue'
import { getProductItem,getSales,getSkuInfo,getFromAddr,isScoped } from '@/utils/request'

export default {
  components: {
    mpvueCityPicker,
    uniRate,
  },
	data() {
		return {
      isFare:false,//是否包邮
      saleCount:0,//成交数量
      maskInfo:{
        lastCount:0,//弹出层 input数量
        maskCount:0,//弹出信息 总数量
        typeCount:0,//弹出层 类型
        maskPrice:0,//弹出层 总价格
        undue:0,
      },
      pid:'1115831',//产品id
      normsStr:'',//规格
      norms:[],//遮罩层--规格
      address: '',//地址
      isScope: true,//是否在配送范围内
      isScopeInfo:{
        provinceCode:'',
        shopId:''
      },
      cityDefault: [0, 0, 0],
      themeColor: '#007AFF',
      evaCount: 3,//评价星数
      cartCount: 0,
			//轮播主图数据
			swiperList: [],
			//轮播图下标
			currentSwiper: 1,
			serviceClass: '',//服务弹窗css类，控制开关动画
			specClass: '',//规格弹窗css类，控制开关动画
			// 商品信息
			goodsData:{},
			selectSpec:null,//选中规格
			isKeep:false,//收藏
			//商品描述html
      descriptionStr:'<div style="text-align:center;"><img width="100%" src="https://s2.ax1x.com/2019/03/28/AdOogx.jpg"/><img width="100%" src="https://s2.ax1x.com/2019/03/28/AdOHKK.jpg"/><img width="100%" src="https://s2.ax1x.com/2019/03/28/AdOTv6.jpg"/></div>',
      skuInfo:{
        areaId :'',//区域
        itemId:'1115831',//id
        sellerId:'',//卖家id
        shopId:'',//店铺id
        skuId:'',//skuid
      },
      shop:{},
      shopAddr:'',//店铺地址
      skuPro:'',
      skuPrice:'',
      specArr:[],//判断规格种类用

		};
  },
  onLoad(options){
    // this.pid = options.pid
  },
	onReady(){
    this.getProduct(this.pid)
    this.getProSales(this.pid)
    this.getIsScoped(this.isScopeInfo)
    this.getAddr()
  },
	//上拉加载，需要自己在page.json文件中配置"onReachBottomDistance"
	onReachBottom() {
		// uni.showToast({ title: '触发上拉加载' });
	},
	methods: {
    // 获得产品数据
    async getProduct(pid){
      const data = await getProductItem(pid)
      if(data.statusCode == 200){
        if(data.data.success){
          this.isFare = data.data.shopFare
          // console.log(data.data.result)
          this.goodsData = data.data.result.product
          this.goodsData.itemPriceVoList.forEach(item=>{
            this.skuInfo.areaId = item.areaId
          })
          this.skuInfo.skuId = this.goodsData.skuList[0].skuId
 
          this.swiperList = this.goodsData.itemPictureList
          this.goodsData.skuList.forEach(item=>{
            item.attributeList.forEach(list=>{
              list.skuId = item.skuId
              this.norms.push(list)
            })
          })

          this.shop = data.data.result.shopInfo
          this.shopAddr = this.shop.provinceName + this.shop.cityName
          this.skuInfo.sellerId = this.shop.sellerId
          this.skuInfo.shopId = this.shop.shopId
          this.isScopeInfo.shopId = this.shop.shopId
          this.normsStr = this.norms[0].attrName+' '+this.norms[0].attrValueName

          this.getSku(this.skuInfo)
        }else{
          uni.showToast({
            title: '数据架加载失败...',
            duration: 2000,
            icon:'none'
          })
        }
      }else{
        uni.showToast({
            title: '网络跑丢了...',
            duration: 2000,
            icon:'none'
        })
      }
    },
    // 获得产品销量
    async getProSales(id){
      const res = await getSales(id)
      if(res.statusCode==200){
        if(res.data.success){
          this.saleCount = res.data.result
        }else{
          uni.showToast({
            title: '数据加载失败...',
            duration: 2000,
            icon:'none'
          })
        }
      }else{
        uni.showToast({
          title: '网络跑丢了...',
          duration: 2000,
          icon:'none'
        })
      }
    },
    // 获得sku信息
    async getSku(sku){
      const res = await getSkuInfo(sku)
      if(res.statusCode==200){
        if(res.data.success){
          this.skuPro = res.data.result
          this.skuPro.price.forEach(item=>{
            this.skuPrice = item.sellPrice
          })
        }else{
          uni.showToast({
            title: '数据加载失败...',
            duration: 2000,
            icon:'none'
          })
        }
      }else{
        uni.showToast({
          title: '网络跑丢了...',
          duration: 2000,
          icon:'none'
        })
      }
    },
    // 获得地址
    async getAddr(){
      const res = await getFromAddr()
      if(res.statusCode==200){
        if(res.data.success){
          this.address = res.data.result.fullAddress
          this.isScopeInfo.provinceCode = res.data.result.provinceCode
        }else{
          uni.showToast({
            title: '数据加载失败...',
            duration: 2000,
            icon:'none'
          })
          this.address = '北京市 东城区'
        }
      }
    },
    // 是否在配送范围内
    async getIsScoped(info){
      const res = await isScoped(info)
      console.log(res.data.result)
    },
		//轮播图指示器
		swiperChange(event) {
			this.currentSwiper = event.detail.current+1;
		},
		//收藏
		keep(){
			this.isKeep = this.isKeep?false:true;
		},
		// 加入购物车
		joinCart(){
			if(this.selectSpec==null){
				return this.showSpec(()=>{
					uni.showToast({title: "已加入购物车"});
				});
			}
			uni.showToast({title: "已加入购物车"});
		},
		//立即购买
		buy(){
			if(this.selectSpec==null){
				return this.showSpec(()=>{
					this.toConfirmation();
				});
			}
			this.toConfirmation();
		},
		//跳转确认订单页面
		toConfirmation(){
			let tmpList=[];
			let goods = {id:this.goodsData.id,img:'../../static/img/goods/p1.jpg',name:this.goodsData.name,spec:'规格:'+this.goodsData.spec[this.selectSpec],price:this.goodsData.price,number:this.goodsData.number};
			tmpList.push(goods);
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
		//跳转评论列表
		showComments(goodsid){
			
		},
		//选择规格
		setSelectSpec(index,id){
      const _this = this
      _this.selectSpec = index;
      _this.maskInfo.lastCount = 0
      if(_this.specArr.indexOf(id)==-1){//获得规格种类的数量 保存已添加规格产品的数量
        let spec = {
          id:id,
          num:0
        }
        _this.specArr.push(spec)
      }
      if(_this.specArr.length>2){//去重
        let hash={}
        _this.specArr = _this.specArr .reduce((item,next)=>{
          hash[next.id]?'':hash[next.id]=true&&item.push(next)
          return item
        },[])
      }
      _this.skuInfo.skuId = id
      _this.maskInfo.lastCount = _this.specArr[_this.selectSpec].num
      
      if(_this.specArr.length==1){
        _this.maskInfo.lastCount = _this.maskInfo.maskCount
      }
      _this.getSku(_this.skuInfo)
		},
		//减少数量
		sub(){
			if(this.maskInfo.lastCount<1){
				return;
      }
      // console.log(this.maskInfo)
      this.maskInfo.lastCount--
      this.maskInfo.undue = this.maskInfo.lastCount

      this.maskInfo.maskCount -=1
      if(this.maskInfo.undue==0){
        this.maskInfo.typeCount-=1
      }
      this.specArr[this.selectSpec].num -=  1
      this.maskInfo.maskPrice =  this.maskInfo.maskCount*(parseInt(this.skuPrice*1000))/1000
		},
		//增加数量
		add(){
      this.maskInfo.typeCount = this.specArr.length
      // if(this.skuPro.inventory==0){
      //    uni.showToast({
      //     title: '商品已售罄...',
      //     duration: 2000,
      //     icon:'none'
      //   })
      //   return
      // }else{
        this.maskInfo.lastCount++
        this.specArr[this.selectSpec].num =  this.maskInfo.lastCount
        this.maskInfo.undue = this.maskInfo.lastCount
        this.maskInfo.maskCount ++
        this.maskInfo.maskPrice =  this.maskInfo.maskCount*(parseInt(this.skuPrice*1000))/1000
      //   if(this.mask.lastCount == this.skuPro.inventory && this.skuPro.inventory != 0){
      //     uni.showToast({
      //       title: '库存不足...',
      //       duration: 2000,
      //       icon:'none'
      //     })
      //   }
      // }
      
		},
		//返回上一页
		back() {
			uni.navigateBack();
		},

		//规格弹窗
		showSpec(fun) {
			console.log('show');
			this.specClass = 'show';
			this.specCallback = fun;
		},
		specCallback(){
			return;
		},
		//关闭规格弹窗
		hideSpec() {
			this.specClass = 'hide';
			//回调
			this.specCallback&&this.specCallback();
			this.specCallback = false;
			setTimeout(() => {
				this.specClass = 'none';
			}, 250);
		},
		discard() {
      //丢弃
      
    },
     // 城市选择
    onConfirm (e) {
      this.address = e.label
    },
    onCancel (e) {
      return
    },
    showAddr () {
      this.$refs.mpvueCityPicker.show()
    },
    // 评价
    onChange (e) {
      this.evaCount = e.value
    },

    allProduct(){
      // 全部商品
    },
    newProduct(){
      // 店铺新品
    },
	}
};
</script>

<style lang="scss">
.swiper-box {
	width: 100%;
  height: 640upx;
  position: relative;
  background: #fff;
  padding: 0 20upx;
  box-sizing: border-box;
  border-bottom: 1px solid #bbb;
	swiper {
		width: 100%;
    height: 100%;
		swiper-item {
			image {
				width: 100%;
				height: 100%;
			}
		}
  }
  .curImg{
    width: 48upx;
    height: 48upx;
    line-height: 48upx;
    text-align: center;
    color:#fff;
    background: rgba(115, 112, 112, 0.6);
    border-radius: 50%;
    font-size: 24upx;
    position: absolute;
    bottom: 20upx;
    right: 20upx;
  }
}
.info-box {
	width: 92%;
	padding: 20upx 4%;
	background-color: #fff;
	margin-bottom: 20upx;
}
.imgEvaluate {
  background: #fff;
  .imgTextDetail {
    margin-top: 20upx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20upx 0;
    border-bottom: 1px solid #bbb;
    .imgtitle {
      font-size: 24upx;
      color: #666;
    }
    .rightIcon {
      font-size: 40upx;
      color: #666;
    }
  }
  .evaluate {
    display: flex;
    align-items: center;
    padding: 20upx 0;
    .evaTitle {
      width: 20%;
      font-size: 24upx;
      color: #666;
    }
    .evaRate {
      width: 80%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .evaCount {
        font-size: 24upx;
        color: #333;
      }
      .rate {
        display: flex;
        align-items: center;
        font-size: 24upx;
        color: #666;
        span {
          padding-left: 10upx;
        }
      }
    }
  }
}
 .curShop {
  margin-top: 20upx;
  background: #fff;
  padding: 20upx;
  .shopInfo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .shopName {
      display: flex;
      justify-content: center;
      .logo {
        width: 96upx;
        height: 96upx;
        border: 1px solid #bbb;
      }
      .cityName {
        padding: 0 20upx;
        .cityCol {
          font-size: 28upx;
          color: #333;
          span {
            background: #d24845;
            border-radius: 6upx;
            padding: 2upx 6upx;
            font-size: 24upx;
            color: #fff;
            margin-left: 10upx;
          }
        }
        .city {
          font-size: 24upx;
          color: #999;
          padding: 10upx 0;
        }
      }
    }
    .rightIcon {
      font-size: 40upx;
      color: #666;
    }
  }
  .selectTab {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20upx;
    .allPro,
    .newPeo {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #bbb;
      width: calc(100% / 2.2);
      border-radius: 8upx;
      padding: 10upx 0;
      .allText {
        font-size: 24upx;
        color: #666;
        padding-left: 4upx;
      }
    }
  }
}
.goods-info {
	.priceBox {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20upx;
		.price{
      font-size: 36upx;
      font-weight: 600;
      color: #f06c7a;
    }
    .sellCount{
      font-size: 24upx;
      color: #999;
      span{
        color: #f06c7a;
        padding: 0 4upx;
      }
    }
  }
  .logisticsBox{
    padding-top: 20upx;
    border-top: 1px solid #bbb;
    display: flex;
    .log-item{
      flex: auto;
      font-size: 24upx;
      color:#999;
      span{
        padding: 0 10upx;
      }
    }
    .log-city{
      text-align: right;
    }
  }
	.title {
    height: 80upx;
    font-size: 28upx;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    span{
      background: #f06c7a;
      color:#fff;
      padding: 4upx 6upx;
      border-radius: 6upx;
      font-size: 24upx;
      margin-right: 10upx;
    }
	}
}
.spec {
	.row {
		width: 100%;
		display: flex;
    align-items: center;
    padding: 20upx 0;
		.text {
			font-size: 24upx;
			color: #a2a2a2;
			margin-right: 20upx;
    }
    .log-addr {
      font-size: 24upx;
      color: #666;
      padding-right: 4upx;
    }
    .addrScope{
      color:#f06c7a;
    }
    .selectText{
      margin-right: 40upx;
    }
		.content {
			font-size: 24upx;
			display: flex;
			flex-wrap: wrap;
			.serviceitem{
				margin-right: 10upx;
			}
			.sp {
				width: 100%;
        display: flex;
        font-size: 24upx;
        color:#666;
				view {
					background-color: #f6f6f6;
					padding: 5upx 10upx;
					color: #999;
					margin-right: 10upx;
					font-size: 24upx;
					border-radius: 5upx;
					&.on{
						border: solid 1upx #f47952;
						padding: 4upx 8upx;
					}
				}
			}
		}
		.arrow {
			position: absolute;
			right: 4%;
			.icon {
				color: #ccc;
			}
		}
  }
  .choose{
    border-bottom: 1px solid #bbb;
  }
}
.comments {
	.row {
		width: 100%;
		height: 40upx;
		display: flex;
		align-items: center;
		margin: 0 0 30upx 0;
		.text {
			font-size: 24upx;
		}
		.arrow {
			font-size: 24upx;
			position: absolute;
			right: 4%;
			color: #17e6a1;
			.show {
				display: flex;
				align-items: center;
				.icon {
					color: #17e6a1;
				}
			}
		}
	}
	.comment {
		width: 100%;
		.user-info {
			width: 100%;
			height: 40upx;
			display: flex;
			align-items: center;
			.face {
				width: 40upx;
				height: 40upx;
				margin-right: 8upx;
				image {
					width: 40upx;
					height: 40upx;
					border-radius: 100%;
				}
			}
			.username {
				font-size: 24upx;
				color: #999;
			}
		}
		.content {
			margin-top: 10upx;
			font-size: 24upx;
		}
	}
}
.description {
	.title {
		width: 100%;
		height: 80upx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24upx;
		color: #999;
	}
}
.footer {
	position: fixed;
	bottom: 0upx;
	width: 100%;
	height: 80upx;
	border-top: solid 1upx #bbb;
	background-color: #fff;
	z-index: 2;
	display: flex;
	justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
	.icons {
    width: 40%;
		display: flex;
		height: 80upx;
		.box {
			width: calc(100%/2);
			height: 80upx;
			display: flex;
			justify-content: center;
      flex-wrap: wrap;
      position: relative;
      border-right: 1px solid #bbb;
			.icon {
				font-size: 24upx;
				color: #828282;
      }
      .boxIcon{
        margin-top: 10upx;        
      }
			.text {
				display: flex;
				justify-content: center;
				width: 100%;
				font-size: 24upx;
				color: #666;
      }
      .proNum{
        display: block;
        width: 30upx;
        height: 30upx;
        text-align: center;
        line-height: 30upx;
        border-radius: 50%;
        background: #d24845;
        color:#fff;
        font-size: 24upx;
        position: absolute;
        top:5upx;
        right: 40upx;
        z-index: 3;
      }
		}
	}
	.btn {
    width: 60%;
		height: 80upx;
    display: flex;
		.joinCart,
		.buy {
      width: calc(100% /2);
			height: 80upx;
			color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28upx;
		}
		.joinCart {
			background-color: #f0b46c;
		}
		.buy {
			background-color: #f06c7a;
		}
	}
}
.popup {
	position: fixed;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: 20;
	display: none;
	.mask{
		position: fixed;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 21;
		background-color: rgba(0, 0, 0, 0.6);
	}
	.layer {
		position: fixed;
		z-index: 22;
		bottom: -70%;
		width: 92%;
		padding: 0 4%;
		height: 70%;
		border-radius: 20upx 20upx 0 0;
		background-color: #fff;
		display: flex;
		flex-wrap: wrap;
		align-content: space-between;
		.content {
			width: 100%;
			padding: 20upx 0;
		}
    .proAbout {
      display: flex;
      .image {
        width: 30%;
        height: 200upx;
        border: 1px solid #bbb;
        border-radius: 8upx;
        position: relative;
        top: -40upx;
        background: #fff;
        image {
          width: 100%;
          height: 100%;
          border-radius: 8upx;
        }
      }
      .skuProName {
        width: 70%;
        padding-left: 20upx;
        .name {
          font-size: 28upx;
          height: 40px;
          margin: 10px 0 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .price {
          font-size: 28upx;
          color: #d24845;
        }
      }
    }
    .isSelf {
      font-size: 24upx;
      color: #fff;
      background: #d24845;
      padding: 4upx 8upx;
      border-radius: 8upx;
      margin-right: 10upx;
    }
    .computedPrice{
      width: 100%;
      background: #ffe4df;
      padding: 10upx 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      position: absolute;
      bottom: 100upx;

      .count{
        font-size: 24upx;
        padding: 0 4upx;
      }
      .price{
        font-size: 24upx;
        padding-right: 20upx;
        color:#d24845;
      }
    }
		.btn {
      width: 100%;
      height: 100upx;
      display: flex;
			.button {
				flex: 1;
				height: 80upx;
        line-height: 80upx;
        text-align: center;
				color: #fff;
				background: #f0b46c;
				font-size: 28upx;
      }
      .buyNow{
        background: #d24845;
      }
      
		}
  }
  .shadowInfo{
    width: 100%;
    padding: 0;
    border-radius: 0;
    .content{
      padding: 0 3%;
    }
  }
	@keyframes showPopup {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	@keyframes hidePopup {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	@keyframes showLayer {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-100%);
		}
	}
	@keyframes hideLayer {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(0);
		}
	}
	&.show {
		display: block;
		.mask{
			animation: showPopup 0.25s linear both;
		}
		.layer {
			animation: showLayer 0.25s linear both;
		}
	}
	&.hide {
		display: block;
		.mask{
			animation: hidePopup 0.25s linear both;
		}
		
		.layer {
			animation: hideLayer 0.25s linear both;
		}
	}
	&.none {
		display: none;
	}
	&.service {
		.row {
			margin: 30upx 0;
			.title {
				font-size: 28upx;
				margin: 10upx 0;
			}
			.description {
				font-size: 28upx;
				color: #999;
			}
		}
	}
	&.spec {
		.title {
			font-size: 28upx;
			margin: 30upx 0;
		}
		.sp {
      display: flex;
      align-items: center;
      // flex-wrap:wrap;
			.normsSty {
				font-size: 24upx;
				border-radius: 8upx;
        margin-right:22upx;
        padding: 10upx 20upx;
        color: #666;
        background: #f6f6f6;
        // border: solid 1upx transparent;
        // box-sizing: border-box;
				&.on {
          background: #d24845;
          color: #fff;
				}
			}
		}


		.length{
			margin-top: 30upx;
			border-top: solid 1upx #aaa;
			display: flex;
			align-items: center;
			padding-top: 20upx;
      .lenCount{
        flex:1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .text{
				  font-size: 30upx;
          margin-right: 20upx;
        }
        .number{
          display: flex;
          justify-content: center;
          align-items: center;
          .input{
            width: 80upx;
            height: 52upx;
            margin: 0 10upx;
            background-color: #fff;
            border:1px solid #bbb;
            border-radius: 4upx;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            input{
              width: 80upx;
              height: 60upx;
              display: flex;
              justify-content: center;
              align-items: center;
              text-align: center;
              font-size: 26upx;
            }
          }
          
          .sub ,.add{
            width: 60upx;
            height: 60upx;
            background-color: #f3f3f3;
            border-radius: 5upx;
            .icon{
              font-size: 30upx;
              width: 60upx;
              height: 60upx;
              display: flex;
              justify-content: center;
              align-items: center;
              
            }
          }
        }
      }
      .stockCount{
        flex:1;
        font-size: 24upx;
        color: #999;
        padding-left: 20upx;
      }
			
		}
		
	}
}
.pullUp{
  width: 100%;
  height:80upx;
  line-height: 80upx;
  background: #fff;
  text-align: center;
  font-size: 24upx;
  border-top: 1px solid #bbb;
  margin-bottom: 120upx;
  color: #999;
}
</style>
