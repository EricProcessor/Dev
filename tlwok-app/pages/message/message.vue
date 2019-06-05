<template>
  <view>
    <template v-if="type=='buyer'">
      <view class="msgList" v-for="(item,i) in list" :key="i">
        <view>
          <view class="msgTime">{{item.created}}</view>
        </view>
        <view class="msgInfo" @tap="linkDetail(item.id)">
          <view class="msgTitle">{{type=='buyer'?'买家消息':'卖家消息'}}</view>
          <view class="msgText">{{item.context}}</view>
        </view>
      </view>
    </template>
    <template v-else></template>
  </view>
</template>

<script>
import { getBuyerMess } from '@/utils/request'

export default {
  data () {
    return {
      type: '',
      buyMess: {
        pageNum: 1,
        pageSize: 10
      },

      list: []
    };
  },
  onLoad (option) {
    this.type = option.msg
  },
  onReady () {
    this.getMessage(this.buyMess)
  },
  methods: {
    async getMessage (msg) {
      const result = await getBuyerMess(msg)
      if (result.statusCode == 200) {
        result.data.list.forEach(item => {
          item.buyerMess.forEach(item2 => {
            item2.created = this.formatDate(item2.created)
          })
          this.list = item.buyerMess
        })
      }
    },
    linkDetail (id) {
      console.log(id)
    },
    formatDate (date) {
      let d = new Date(date).toLocaleString()
      return d
      Date.prototype.toLocaleString = function () {
        function addZero (num) {
          if (num < 10)
            return "0" + num;
          return num;
        }
        // 按自定义拼接格式返回
        return this.getFullYear() + "/" + addZero(this.getMonth() + 1) + "/" + addZero(this.getDate()) + " " +
          addZero(this.getHours()) + ":" + addZero(this.getMinutes()) + ":" + addZero(this.getSeconds());
      }
    },
  }
}
</script>

<style scoped lang="scss">
.msgList {
  padding: 20upx;
  .msgTime {
    width: 400upx;
    margin: 0 auto;
    text-align: center;
    background: #ccc;
    color: #fff;
    border-radius: 60upx;
    overflow: hidden;
  }
  .msgInfo {
    background: #fff;
    margin-top: 30upx;
    padding: 20upx;
    .msgText {
      width: 100%;
      line-height: 36upx;
      font-size: 28upx;
      -o-text-overflow: ellipsis;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-weight: normal;
      color: #999;
      margin-top: 8upx;
    }
  }
}
</style>
