<template>
  <view class="uni-tab-bar">
    <scroll-view id="tab-bar" class="uni-swiper-tab" scroll-x :scroll-left="scrollLeft">
      <view
        v-for="(tabItem,index) in tabBars"
        :key="index"
        class="swiper-tab-list tabItem"
        :class="tabIndex==index ? 'active' : ''"
        :id="tabItem.id"
        :data-current="index"
        @click="tapTab(index)"
      >{{tabItem.name}}({{tabItem.number}})</view>
    </scroll-view>
    <swiper :current="tabIndex" class="swiper-box" :duration="300" @change="changeTab">
      <swiper-item v-for="(items,index1) in favoriteItems" :key="index1">
        <scroll-view class="list" scroll-y @scrolltolower="loadMore(index1)">
          <block v-for="(item,index2) in items" :key="index2">
            <favoriteList
              :options="item"
              :index="index1"
              :editStatus="editStatus"
              :checkStatus="checkStatus"
            ></favoriteList>
          </block>
          <!-- <view class="uni-tab-bar-loading">
						{{tab.loadingText}}
          </view>-->
        </scroll-view>
      </swiper-item>
    </swiper>
    <view class="editView" v-if="editStatus==1">
      <view class="allC">
        <label class="radio">
          <radio value="r2"/>全选
        </label>
      </view>
      <view class="editBtn" @tap="cancelCollect">取消收藏</view>
    </view>
  </view>
</template>
<script>
import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
import favoriteList from "@/components/list/favoriteList.vue";
import {
  getFavoritePro,
  getFavoriteShop,
  getFavoriteCount
} from "@/utils/request";

export default {
  components: {
    uniLoadMore,
    favoriteList
  },
  data() {
    return {
      editStatus: 0,
      scrollLeft: 0,
      tabIndex: 0,
      checkStatus: false,
      isClickChange: false,
      tabBars: [
        {
          name: "商品",
          number: 0,
          id: "noused"
        },
        {
          name: "供应商",
          number: 0,
          id: "used"
        }
      ],
      favoriteItems: {
        goods: [],
        shop: []
      },
      favInfo: {
        pageNum: 1,
        pageSize: 10
      }
    };
  },
  onNavigationBarButtonTap() {
    let pages = getCurrentPages();
    let page = pages[pages.length - 1];
    this.editStatus = this.editStatus == 0 ? 1 : 0;
    this.checkStatus = false;
    // #ifdef APP-PLUS
    let currentWebview = page.$getAppWebview();
    let titleObj = currentWebview.getStyle().titleNView;
    if (!titleObj.buttons) {
      return;
    }
    titleObj.buttons[0].text =
      titleObj.buttons[0].text === "编辑" ? "完成" : "编辑";
    currentWebview.setStyle({
      titleNView: titleObj
    });
    // #endif
  },
  onReady() {
    this.getFavoriteData(this.favInfo);
    this.getFavoriteShops(this.favInfo);
    this.getFavNumber(this.favInfo);
  },
  methods: {
    loadMore(e) {
      this.favInfo.pageNum++;
      this.getFavoriteData(this.favInfo);
    },
    async changeTab(e) {
      this.editStatus = 0;
      let index = e.detail.current;
      if (this.isClickChange) {
        this.tabIndex = index;
        this.isClickChange = false;
        return;
      }
      let tabBar = await this.getElSize("tab-bar"),
        tabBarScrollLeft = tabBar.scrollLeft;
      let width = 0;
      for (let i = 0; i < index; i++) {
        let result = await this.getElSize(this.tabBars[i].id);
        width += result.width;
      }
      let winWidth = uni.getSystemInfoSync().windowWidth,
        nowElement = await this.getElSize(this.tabBars[index].id),
        nowWidth = nowElement.width;
      if (width + nowWidth - tabBarScrollLeft > winWidth) {
        this.scrollLeft = width + nowWidth - winWidth;
      }
      if (width < tabBarScrollLeft) {
        this.scrollLeft = width;
      }
      this.isClickChange = false;
      this.tabIndex = index; //一旦访问data就会出问题
    },
    getElSize(id) {
      //得到元素的size
      return new Promise((res, rej) => {
        uni
          .createSelectorQuery()
          .select("#" + id)
          .fields(
            {
              size: true,
              scrollOffset: true
            },
            data => {
              res(data);
            }
          )
          .exec();
      });
    },
    async tapTab(index) {
      this.editStatus = 0;
      //点击tab-bar
      if (this.tabIndex === index) {
        return false;
      } else {
        let tabBar = await this.getElSize("tab-bar");
        let tabBarScrollLeft = tabBar.scrollLeft; //点击的时候记录并设置scrollLeft
        this.scrollLeft = tabBarScrollLeft;
        this.isClickChange = true;
        this.tabIndex = index;
      }
    },
    // 获得收藏数量
    async getFavNumber(supply) {
      const result = await getFavoriteCount(supply);
      console.log(result)
      // if (count.statusCode == 200) {
      //     this.tabBars[0].number = count.data.list[0].item
      //     this.tabBars[1].number = count.data.list[0].shop
      // }
    },
    // 获得收藏商品数据
    async getFavoriteData(favInfo) {
      const result = await getFavoritePro(favInfo);
      if (favInfo.pageNum == 1) {
        if (result.statusCode == 200) {
          this.favoriteItems.goods = result.data.list;
        } else {
          uni.showToast({
            title: "数据加载失败",
            duration: 2000,
            icon: "none"
          });
        }
      } else {
        if (result.data.list) {
          result.data.list.forEach(item => {
            this.favoriteItems.goods.push(item);
          });
        } else {
          uni.showToast({
            title: "没有更多数据了",
            duration: 2000,
            icon: "none"
          });
        }
      }
    },
    // 获得收藏店铺数据
    async getFavoriteShops(favInfo) {
      const result = await getFavoriteShop(favInfo);
      // console.log(result);
      if (favInfo.pageNum == 1) {
        if (result.statusCode == 200) {
          this.favoriteItems.shop = result.data.list;
        } else {
          uni.showToast({
            title: "数据加载失败",
            duration: 2000,
            icon: "none"
          });
        }
      } else {
        if (result.data.list) {
          result.data.list.forEach(item => {
            this.favoriteItems.shop.push(item);
          });
        } else {
          uni.showToast({
            title: "没有更多数据了",
            duration: 2000,
            icon: "none"
          });
        }
      }
    },
    cancelCollect() {
      this.editStatus = 0;
    }
  }
};
</script>

<style scoped lang="scss">
.uni-tab-bar {
  .uni-swiper-tab {
    //couponHeader
    background: #ffffff;
    border: none;
    .tabItem {
      display: inline-block;
      width: 50% !important;
      text-align: center;
      height: 50px;
      line-height: 50px;
      box-sizing: border-box;
    }
    .active {
      color: #e4393c;
    }
  }
  .editView {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    width: 100%;
    background: #e8eff4;
    display: flex;
    justify-content: flex-start;
    view {
      display: inline-block;
      height: 100upx;
      line-height: 100upx;
    }
    .allC {
      width: 70%;
      color: #666;
      padding-left: 50upx;
    }
    .editBtn {
      width: 30%;
      color: #fff;
      text-align: center;
      background: #e4393c;
    }
  }
}
</style>
