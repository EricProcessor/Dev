<template>
  <view>
    <view class="newsItem" v-for="(items,i) in news" @tap="toMsg(items.type)" :key="i">
      <view class="itemLeft">
        <image src="/static/image/img_order.png"></image>
        <view class="uni-badge">{{items.num}}</view>
      </view>
      <view class="itemRight">
        <view class="newsType">
          <view class="type">{{items.type == 'buyer' ?'我是买家':'我是卖家'}}</view>
          <view class="time">{{items.newsTime}}</view>
        </view>
        <view class="newsContext">{{items.newsContext}}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getNewsList } from '@/utils/request'
export default {
  data () {
    return {
      news: [{
        type: "buyer",
        num: '10',
        newsTime: "2019.2.12 11:12",
        newsContext: "〖订单变更提醒〗尊敬的顾客您好，您的订单2668409出现金额变更，当前订单金额为0.01, 请确认后再进行支付！"
      }, {
        type: "seller",
        num: '10',
        newsTime: "2019.2.12 11:12",
        newsContext: "〖订单变更提醒〗尊敬的顾客您好，您的订单2668409出现金额变更，当前订单金额为0.01, 请确认后再进行支付！"
      }]
    };
  },
  onReady () {
    // this.getNews(this.newsInfo)
  },
  methods: {
    // async getNews (info) {
    //   const result = await getNewsList(info)
    //   if(result.statusCode==200){
    //     console.log(result )
    //   }
    // },
    toMsg: function (type) {
      uni.navigateTo({
        url: '/pages/message/message?msg=' + type + ''
      });
    }
  }
}
</script>

<style scoped lang="scss">
.newsItem {
  margin-top: 20upx;
  background: #fff;
  border-radius: 20upx;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .itemLeft {
    width: 20%;
    padding: 0 20upx;
    text-align: center;
    position: relative;
    image {
      width: 70upx;
      height: 70upx;
      margin-top: 20upx;
    }
    .uni-badge {
      position: absolute;
      top: 10upx;
      right: 20upx;
      display: inline-block;
      background: #e4393c;
      color: #fff;
      text-align: center;
    }
  }
  .itemRight {
    width: 100%;
    .newsType {
      display: flex;
      justify-content: space-between;
      .time {
        color: #999;
        font-size: 24upx;
        margin-right: 20upx;
      }
    }
    .newsContext {
      font-size: 24upx;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-weight: normal;
      color: #999;
      -webkit-line-clamp: 1;
    }
  }
}
</style>
