<template>
  <view class="orderBox">
    <view class="status_bar">
      <view class="top_view"></view>
    </view>
    <view class="header">
      <i class="tlwok-icon tlwicon-back" @tap="back()"></i>
      <view class="centers">
        <text>我的订单</text>
      </view>
      <i class="tlwok-icon tlwicon-mark"></i>
    </view>
    <!-- 占位 -->
    <view class="place"></view>

    <!-- 选项卡 -->
    <view class="uni-tab-bar">
      <scroll-view id="tab-bar" class="uni-swiper-tab" scroll-x :scroll-left="scrollLeft">
        <view
          v-for="(tab,index) in tabBars"
          :key="tab.id"
          class="swiper-tab-list"
          :class="tabIndex==index ? 'active' : ''"
          :id="tab.id"
          :data-current="index"
          @click="tapTab"
        >{{tab.name}}</view>
      </scroll-view>
      <swiper :current="tabIndex" class="swiper-box" :duration="300" @change="changeTab">
        <swiper-item v-for="(ordedatas,index1) in orderitems" :key="index1">
          <scroll-view class="list" scroll-y @scrolltolower="loadMore(index1)">
            <template v-if="!ordedatas.length">
              <view class="noOrder">
                <view class="tlwok-icon tlwicon-text"></view>
                <text>您还没有相关订单</text>
              </view>
            </template>
            <template v-else>
              <block v-for="(orderitem,index2) in ordedatas" :key="index2">
                <order-list :options="orderitem"></order-list>
              </block>
            </template>
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
import uniPopup from '@/components/uni-popup/uni-popup.vue'
import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
import orderList from '@/components/list/orderList.vue'
import { getOrderList } from '@/utils/request'
export default {
  components: {
    uniPopup,
    orderList
  },
  data () {
    return {
      info: {
        orderType: 0,
        pageNum: 1,
        pageSize: 10
      },
      allPages: 2,
      type: '',//弹框位置类型
      //tab切换
      tabIndex: 0,
      scrollLeft: 0,
      isClickChange: false,
      tabBars: [
        { name: '全部', id: 'all' },
        { name: '待付款', id: 'Pendingpayment' },
        { name: '待发货', id: 'toShipped' },
        { name: '待收货', id: 'beRecived' },
        { name: '待评价', id: 'beEvaluated' },
        { name: '订单完成', id: 'succTrad' },
      ],
      orderitems: {
        all: [],//全部
        Pendingpayment: [],//待付款
        toShipped: [],//待发货
        beRecived: [],//待收货
        beEvaluated: [],//待评价
        succTrad: [],//订单完成

      }
    };
  },
  onLoad: function (option) {
    this.tabIndex = option.item;
    switch (Number(this.tabIndex)) {
      case 0:
        this.info.orderType = 0
        break
      case 1:
        this.info.orderType = 10
        break
      case 2:
        this.info.orderType = 20
        break
      case 3:
        this.info.orderType = 30
        break
      case 4:
        this.info.orderType = 991
        break
      case 5:
        this.info.orderType = 99
        break
    }
  },
  onReady () {
    this.getOrder(this.info)
  },
  onBackPress () {
    if (this.type !== '') {
      this.type = '';
      return true;
    }
  },
  methods: {
    back () {
      uni.navigateBack({
        delta: 1
      })
    },
    getOrder (info) {
      this.decomposeData(info)
    },
    async tapTab (e) { //点击tab-bar
      let tabIndex = e.target.dataset.current;
      console.log(tabIndex);
      // 				if(this.newsitems[tabIndex].data.length === 0){
      // 					this.addData(tabIndex)
      // 				}
      if (this.tabIndex === tabIndex) {
        return false;
      } else {
        let tabBar = await this.getElSize("tab-bar"),
          tabBarScrollLeft = tabBar.scrollLeft; //点击的时候记录并设置scrollLeft

        this.scrollLeft = tabBarScrollLeft;
        this.isClickChange = true;
        this.tabIndex = tabIndex;

      }
    },
    async changeTab (e) {
      let index = e.target.current;
      // 				if(this.newsitems[index].data.length === 0){
      // 					this.addData(index)
      // 				}
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
    getElSize (id) { //得到元素的size
      return new Promise((res, rej) => {
        uni.createSelectorQuery().select("#" + id).fields({
          size: true,
          scrollOffset: true
        }, (data) => {
          res(data);
        }).exec();
      })
    },
    loadMore (index) {
      console.log(index)
      this.info.pageNum++
      this.getOrder(this.info)
    },
    // 数据分解
    async decomposeData (info) {
      const res = await getOrderList(info)
      if (res.statusCode == 200) {
        // console.log(res.data)       
        if (this.info.pageNum == 1) {
          switch (this.info.orderType) {
            case 0:
              this.orderitems.all = this.cycleData(res.data.list)
              break
            case 10:
              this.orderitems.Pendingpayment = this.cycleData(res.data.list)
              break
            case 20:
              this.orderitems.toShipped = this.cycleData(res.data.list)
              break
            case 30:
              this.orderitems.beRecived = this.cycleData(res.data.list)
              break
            case 99:
              this.orderitems.succTrad = this.cycleData(res.data.list)
              break
            case 991:
              this.orderitems.beEvaluated = this.cycleData(res.data.list)
              break
          }
          this.allPages = res.data.pages
        } else if (this.info.pageNum <= this.allPages) {
          res.data.list.forEach(item => {
            this.orderitems.all.push(item)
          })
        } else {
          uni.showToast({
            title: "没有更多数据了...",
            duration: 2000,
            icon: "none"
          })
        }

      } else {
        uni.showToast({
          title: "数据请求失败",
          duration: 2000,
          icon: "none"
        })
      }

    },
    //遍历数据
    cycleData (data) {
      data.forEach(item1 => {
        item1.addHide = true
        item1.allCount = 0
        if (item1.items.length != undefined) {
          if (item1.items.length > 1) {
            item1.items.forEach(item2 => {
              item1.allCount += item2.num
            })
          } else if (item1.items.length == 1) {
            item1.items.forEach(item2 => {
              item1.allCount = item2.num
            })
          } else {
            item1.addHide = false
          }
        }

      })
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  .tlwok-icon {
    font-size: 46upx;
    padding: 0 20upx;
  }
  .centers {
    display: flex;
    .unfold {
      font-size: 25upx;
    }
  }
}
.active {
  color: #e4393c;
  font-weight: bold;
}
.uni-swiper-tab {
  border: none;
  background-color: #ffffff;
}
.orderBox {
  height: 100%;
  .uni-tab-bar {
    margin-top: 84upx;
    .list {
      .noOrder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .tlwicon-text {
          font-size: 200upx;
          color: #cccccc;
        }
        text {
          font-size: 40upx;
          color: #cccccc;
        }
      }
    }
  }
}
</style>
