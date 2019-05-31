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
        <view class="right" @tap="showLink">
          <i class="tlwok-icon tlwicon-more_light"></i>
        </view>
      </view>
      <view class="history" v-if="isHistory">
        <view class="hotTitle pos1">
          搜索历史
          <view @tap="deleteAll" class="deleteAll tlwok-icon tlwicon-delete_light"></view>
        </view>
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
      isHistory: true, //是否显示历史记录
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
    showLink() {
      uni.showActionSheet({
        itemList: ["首页", "我的收藏"],
        success: function(res) {
          console.log("选中了第" + (res.tapIndex + 1) + "个按钮");
          if (res.tapIndex == 0) {
            uni.navigateTo({
              url: "/pages/index/index",
              animationType: "pop-in",
              animationDuration: 200
            });
          } else {
            uni.navigateTo({
              url: "/pages/favorite/favorite",
              animationType: "pop-in",
              animationDuration: 200
            });
          }
        },
        fail: function(res) {
          console.log(res.errMsg);
        }
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
    },
    deleteAll() {
      const _this = this;
      uni.showModal({
        //需要修改
        title: "提示",
        content: "确定要清空历史记录吗",
        success: function(res) {
          if (res.confirm) {
            _this.isHistory = false;
          } else if (res.cancel) {
            _this.isHistory = true;
          }
        }
      });
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
      font-size: 24upx;
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
      margin: 20upx 0;
      font-size: 32upx;
      color: #666;
      .deleteAll {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
      }
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
        font-size: 24upx;
        color: #1a1a1a;
      }
    }
  }
}
</style>
