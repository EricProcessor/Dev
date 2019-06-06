<template>
  <view>
    <template v-if="!isShow">
      <view class="historyList" v-for="(items,index1) in historyList" :key="index1">
        <view class="historyTime">{{items.visitDate}}</view>

        <block v-for="(item,index2) in items.mVisitHistoryVos" :key="index2">
          <historyList :options="item"></historyList>
        </block>
      </view>
    </template>
    <template v-else>
      <view class="noList">
        <view class="icon">
          <i class="tlwok-icon tlwicon-text"></i>
        </view>
        <view class="text">
          <view>您没有浏览记录哦~</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import historyList from '@/components/list/historyList.vue'
import { getHistoryList, removeAllHistory } from '@/utils/request'
export default {
  components: { historyList },
  data () {
    return {
      isShow: false,
      historyInfo: {
        pageNum: 1,
        pageSize: 10
      },
      historyList: [],
    };
  },
  onReady () {
    this.getHistoryData(this.historyInfo)
  },
  methods: {
    async getHistoryData (info) {
      let historyData = JSON.parse(localStorage.getItem('history'))
      if (historyData != null && historyData.length != 0) {
        this.historyList = historyData
      } else {
        const result = await getHistoryList(info)
        if (result.statusCode == 200) {
          localStorage.setItem('history', JSON.stringify(result.data.list))
          this.historyList = result.data.list
          this.historyList.length != 0 ? this.isShow = false : this.isShow = true
        }
      }

    }
  },

  async onNavigationBarButtonTap () {
    if (this.historyList.length != 0) {
      const result = await removeAllHistory()
      if (result.success) {
        localStorage.setItem('history', [])
        this.historyList = []
      }

    } else {
      uni.showToast({
        title: '暂无数据',
        duration: 2000,
        icon: 'none'
      })
    }
  },
  onPullDownRefresh () {
    setTimeout(() => {
      this.getHistoryData(this.historyInfo)
      uni.stopPullDownRefresh();
    }, 500)
  },
}
</script>

<style scoped lang="scss">
.historyList {
  .historyTime {
    width: 100%;
    height: 80upx;
    box-sizing: border-box;
    padding-left: 40upx;
    line-height: 80upx;
    font-size: 40upx;
  }
}
</style>
