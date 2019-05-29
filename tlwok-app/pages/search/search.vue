<template>
  <view class="searchBox">
    <!-- 自定义导航头开始 -->
    <view class="status_bar">
      <view class="top_view"></view>
    </view>
    <view class="content">
      <view class="topBar">
        <view class="left" @tap="back">
          <i class="tlwok-icon tlwicon-back"></i>
        </view>
        <view class="input-view">
          <view class="list pos1">
            <input class="showName" @tap="isDown" type="text" v-model="selectOption" disabled>
            <view class="downIcon tlwok-icon tlwicon-unfold"></view>
            <view class="name" v-if="productObj.isShow">
              <view class="pro" @tap="productBtn">{{productObj.product}}</view>
              <view class="vendor" @tap="supplyBtn">{{productObj.supply}}</view>
              <view class="trig"></view>
            </view>
          </view>
          <input
            confirm-type="search"
            @confirm="confirm"
            class="input"
            type="text"
            v-model="keywords"
            placeholder="输入搜索关键词"
          >
          <uni-icon type="search" size="22" @tap="getResult" color="#666666"></uni-icon>
        </view>
        <view class="right">
          <i class="tlwok-icon tlwicon-more_light"></i>
        </view>
      </view>
      <view class="history" v-if="!isHistory">
        <view class="hotTitle">搜索历史</view>
        <view class="hotList">
          <view
            class="hotItem"
            @tap="getKeywords(item.id)"
            v-for="(item,i) in historyData"
            :key="i"
          >{{item.name}}</view>
        </view>
      </view>
      <view class="hotWords">
        <view class="hotTitle">热门搜索</view>
        <view class="hotList">
          <view
            class="hotItem"
            @tap="getKeywords(item.id)"
            v-for="(item,i) in hotKeyword"
            :key="i"
          >{{item.keywords}}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import uniIcon from "@/components/uni-icon/uni-icon.vue";

export default {
  data() {
    return {
      selectOption: "产品",
      productObj: {
        isShow: false,
        product: "产品",
        supply: "供应商"
      },
      supply: {
        words: "",
        pageNum: 1,
        pageSize: 10
      },
      keywords: "", //搜索内容
      isHistory: false, //是否显示历史记录
      historyData: [
        {
          id: 1,
          name: "妥了网"
        },
        {
          id: 2,
          name: "A4纸"
        },
        {
          id: 3,
          name: "收银纸"
        }
      ], //搜索历史记录
      hotKeyword: [
        {
          id: 1,
          keywords: "年中618"
        },
        {
          id: 101,
          keywords: "双十一狂欢"
        },
        {
          id: 102,
          keywords: "国庆钜惠"
        },
        {
          id: 103,
          keywords: "端午甩卖"
        }
      ] //热门搜索
    };
  },
  onReady() {},
  methods: {
    back() {
      uni.navigateBack({
        delta: 1
      });
    },
    getHistoryData() {
      console.log(123);
    },
    getHotSearchData() {
      console.log(123);
    },
    isDown() {
      this.productObj.isShow == true
        ? (this.productObj.isShow = false)
        : (this.productObj.isShow = true);
    },
    productBtn() {
      this.selectOption = this.productObj.product;
      this.productObj.isShow = false;
    },
    supplyBtn() {
      this.selectOption = this.productObj.supply;
      this.productObj.isShow = false;
    },
    getResult() {
      //跳转搜索结果页--商品列表或店铺列表
      console.log(this.keywords);
      // uni.navigateTo({
      //   url: url,
      //   animationType: "pop-in",
      //   animationDuration: 200
      // });
    },
    getKeywords(id) {
      //跳转该商品列表页或商品页
      console.log(id);
      // uni.navigateTo({
      //   url: url,
      //   animationType: "pop-in",
      //   animationDuration: 200
      // });
    }
  },
  components: {
    uniIcon
  }
};
</script>
<style lang="scss" scoped>
view {
  font-size: 28upx;
  line-height: inherit;
}
.content {
  .topBar {
    display: flex;
    background: #fff;
    .left,
    .right {
      display: flex;
      width: 88upx;
      justify-content: center;
      align-items: center;
    }
    .input-view {
      width: 90%;
      display: flex;
      background-color: #e7e7e7;
      height: 30px;
      border-radius: 15px;
      padding: 0 2%;
      flex-wrap: nowrap;
      margin: 7px 0;
      line-height: 30px;
      .uni-icon {
        line-height: 30px !important;
      }
      .input {
        height: 30px;
        line-height: 30px;
        width: 94%;
        padding: 0 3%;
      }
      .list {
        display: flex;
        width: 160upx;
        .showName {
          text-align: center;
          font-size: 28upx;
          top: 2upx;
        }
        .name {
          width: 180upx;
          font-size: 28upx;
          background: #313131;
          color: #fff;
          text-align: center;
          border-radius: 12upx;
          position: absolute;
          top: 100upx;
          left: 84upx;
          .pro {
            padding-top: 10upx;
          }
          .trig {
            width: 0;
            height: 0;
            border-width: 0 20upx 20upx;
            border-style: solid;
            border-color: transparent transparent #313131; /*透明 透明  灰*/
            position: relative;
            top: -142upx;
            left: 30upx;
          }
        }
      }
    }
  }
  .hotWords,
  .history {
    padding: 0 30upx;
    .hotTitle {
      padding: 20upx 0;
      font-size: 32upx;
      color: #666;
    }
    .hotList {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      .hotItem {
        border: 1px solid #eee;
        background: #fff;
        border-radius: 8upx;
        padding: 8upx 16upx;
        margin: 0 10upx 10upx 0;
      }
    }
  }
}
</style>
