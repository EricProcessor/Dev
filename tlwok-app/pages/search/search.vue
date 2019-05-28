<template>
  <view class="searchBox">
    <!-- 自定义导航头开始 -->
		<view class="status_bar">  
			<view class="top_view"></view>  
		</view> 
    <view class="content">
      <view class="sarechAbout">
        <view class="leftBox">
          <view class="list">
            <view class="pro selectName">产品</view>
            <view class="vendor selectName">供货商</view>
          </view>
          <view class="tlwok-icon tlwicon-unfold"></view>
        </view>
        <!-- <view class="rightBox">
          <input class="searchInput" type="search" value="" placeholder="搜索">
        </view> -->
      </view>
    </view> 
  </view>
</template>
<script>
export default {
  data(){
    return {}
  }
}
</script>
<style lang="scss" scoped>
.content{
  .sarechAbout{
    display: flex;
    background: #eee;
    width: 80%;
    position: absolute;
    top:-72upx;
    left: 72upx;
    z-index: 1111;
    .leftBox{
      display: flex;
      width: 84upx;
      padding: 0 8upx;
      .list{
        height: 56upx;
        overflow: hidden;
        .selectName{
          height: 56upx;
          line-height: 56upx;
          font-size: 28upx;
          color: #1a1a1a;
          text-align: center;
        }
      }
      
      
    }
    .rightBox{
      // border: 1px solid red;
      .searchInput{
        border:1px solid #eee;
        background: #fff;
      }
    }
  }
 
}
</style>
