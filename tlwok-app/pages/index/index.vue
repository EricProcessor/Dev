<template>
	<view class="content">
		<Home v-if="page_code=='0'" :picList="picList" :categoryList="categoryList" :swiperList="swiperList" :options="opacity"></Home>
		<Supplier v-if="page_code=='1'" :supply_list='supply_list'></Supplier>
		<!-- <Category v-if="page_code=='2'"></Category> -->
		<Cart v-if="page_code=='3'"></Cart>
		<Mine v-if="page_code=='4'"></Mine>
		<footerBar v-on:currentValue="currentValue" :footerList="footerList" :width="width"></footerBar>
	</view>
</template>

<script>
	import Home from './home/home.vue'
	import Supplier from './supplier/supplier.vue'
	// import Category from './category/category.vue'
	import Cart from './cart/cart.vue'
	import Mine from './mine/mine.vue'
	import footerBar from '@/components/footerBar/footerBar.vue'
	import {
		getIndexFloor,getShopsList
	} from '@/utils/request.js'
	export default {
		data() {
			return {
				page_code: '0',
				opacity: 0,
				//轮播图
				swiperList:[],
				//分类导航
				categoryList:[],
				//商品图
				picList:[],
				width:0,
        footerList:[],
        supply:{
          pageNum:1,
          pageSize:10
        },
        supply_list:[]
			}
		},
		components: {
			Home,
			Supplier,
			Cart,
			// Category,
			Mine,
			footerBar
		},
		onReady() {
		  this.getCurrentData()
		  this.getShops(this.supply);
		},
		onPageScroll(obj) {
			if (this.page_code == 0) {
				if (this.opacity < 1 && obj.scrollTop > 0) {
					this.opacity = obj.scrollTop * 0.005
				} else {
					if (this.opacity >= 1) {
						this.opacity = 1
					}
					if (obj.scrollTop == 0) {
						this.opacity = 0
					}
				}
			}
		},
		methods: {
			currentValue (value) {
				this.page_code = value
			},
			async getCurrentData() {
        const res = await getIndexFloor();
				if (res.data.success) {
					let result = JSON.parse(res.data.result)
					result.floors.forEach(item =>{
						if(item.type == "navigation_sys_module"){
							this.footerList = item.data;
							this.width = 100/Number(item.data.length);
						}
					})
					// console.log(this.footerList)
					for (let i = 0; i < result.floors.length - 1; i++) {
						//轮播图
						result.floors[i].type == "banner_sys_module" ? this.swiperList = result.floors[i].data : '';
						//分类导航
						if (result.floors[i].type == "icon_sys_module") {
							this.categoryList = result.floors[i].data;
						}
						//商品图
						if (result.floors[i].type == "pic_sys_module") {
							let picWidth = 100 / Number(result.floors[i].col)
							result.floors[i].width = picWidth;
							this.picList.push(result.floors[i])
						}
					}
				}
      },
      // 获得店铺数据
      async getShops(supply){
        const result = await getShopsList(supply)
        if(result.data.success){
          this.supply_list = result.data.result
        }
      }
		}
	}
</script>

<style scoped lang="scss">
	.content {
		height: 100%
	}
</style>
