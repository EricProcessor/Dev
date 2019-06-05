  <template>
  <view class="items">
    <!-- <template v-if=""></template> -->
    <view class="item_list">
      <view class="title">
        <view class="tlwok-icon tlwicon-shop"></view>
        <view class="name">{{options.shopName}}</view>
      </view>
      <view class="itemInfo">
        <view class="checkbox-box">
          <view class="checkbox" @tap="selectCurrent(index)">
            <view :class="[options.selected?'on':'']"></view>
          </view>
        </view>
        <view class="orderInfo">
          <view class="orderTime">
            <view class="timeAbout">订单时间：{{options.checkTime}}</view>
            <view class="timeAbout">还款截止时间：{{options.lastPaymentTime}}</view>
          </view>
          <view class="isOverdue">
            <view class="isOrder order">订单编号：{{options.orderId}}</view>
            <view class="isOrder overdueDay" v-if="options.checkStatus==2">逾期 {{options.compare}} 天</view>
          </view>
        </view>
      </view>
      <view class="repayPrice">
        <view class="repayName">还款金额：</view>
        <view class="price">¥ {{options.orderPrice}}</view>
      </view>
    </view>
    <view class="selectAll" v-if="options.checkStatus==3">
      <div class="all">
        <view class="left" @tap="selectAll()">
          <view class="checkbox-box">
            <view class="checkbox">
              <view :class="[isChecked?'on':'']"></view>
            </view>
          </view>
          <text class="txt">全选</text>
        </view>
        <view class="right">
          <view class="right-left">
            <view class="total">
              总计：
              <text class="totalPrice">¥ {{allPrice}}</text>
            </view>
          </view>
          <view class="right-right">还款（{{count}}）</view>
        </view>
      </div>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
    },
    index: {
      type: Number
    },

  },
  data () {
    return {
      count: 0,
      allPrice: 0,
      isChecked: false
    }
  },
  onReady () {

  },
  methods: {
    selectCurrent (i) {
      this.$emit('selectActive', i)
      if (this.options.selected) {
        this.allPrice += this.options.orderPrice
        this.count += 1
      } else {
        this.allPrice -= this.options.orderPrice
        this.count -= 1
      }
    },
    selectAll () {
      if (this.isChecked) {
        this.options.selected = false
        this.isChecked = false
        this.allPrice = 0
        this.count = 0
      } else {
        this.options.selected = true
        this.isChecked = true
      }
    }
  }
}
</script>

<style scoped lang="scss" scoped>
.items {
  margin-top: 10upx;
  .item_list {
    background: #fff;
    .title {
      display: flex;
      align-items: center;
      padding: 20upx;
      border-bottom: 1px solid #ccc;
      .name {
        padding-left: 4upx;
        font-size: 28upx;
        color: #333;
      }
      .tlwicon-shop {
        font-size: 28upx;
      }
    }
    .itemInfo {
      display: flex;
      padding: 0 10upx;
      .checkbox-box {
        width: 10%;
        display: flex;
        align-items: center;
        justify-content: center;
        .checkbox {
          width: 30upx;
          height: 30upx;
          border-radius: 100%;
          border: solid 2upx #ccc;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          .on {
            width: 20upx;
            height: 20upx;
            border-radius: 100%;
            background-color: #e4393c;
          }
        }
      }
      .orderInfo {
        width: 90%;
        display: flex;
        padding: 0 20upx 20upx;
        justify-content: space-between;
        .timeAbout,
        .isOrder {
          padding-top: 20upx;
          font-size: 24upx;
          color: #666;
        }
        .overdueDay {
          width: 180upx;
          height: 48upx;
          line-height: 48upx;
          color: #fff;
          text-align: center;
          padding-top: 0;
          margin-top: 10upx;
          background: url("/static/image/overdue.png") no-repeat center center;
          background-size: 100% 100%;
        }
      }
    }
    .repayPrice {
      display: flex;
      background: #eaefef;
      padding: 30upx 20upx;
      .repayName {
        font-size: 24upx;
        color: #666;
      }
      .price {
        font-size: 30upx;
        color: #e4393c;
      }
    }
  }
  .selectAll {
    width: 100%;
    background: #e8eff4;
    height: 96upx;
    position: fixed;
    bottom: 0upx;
    .all {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .left {
        display: flex;
        padding: 0 20upx;
        .checkbox-box {
          display: flex;
          justify-content: center;
          align-items: center;
          .checkbox {
            width: 28upx;
            height: 28upx;
            border-radius: 100%;
            border: 1px solid #bbb;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            .on {
              width: 20upx;
              height: 20upx;
              border-radius: 100%;
              background-color: #e4393c;
            }
          }
        }
        .txt {
          color: #666;
          margin-left: 10upx;
        }
      }
      .right {
        height: 96upx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .right-left {
          .total {
            font-size: 24upx;
            color: 3666;
            .totalPrice {
              font-size: 28upx;
              color: #e4393c;
            }
          }
        }
        .right-right {
          margin-left: 30upx;
          line-height: 96upx;
          text-align: center;
          background: #e4393c;
          color: #fff;
          font-size: 28upx;
          padding: 0 20upx;
        }
      }
    }
  }
}
</style>
