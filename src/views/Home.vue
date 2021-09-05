<template>
  <div class="screen-container">
    <header class="screen-header">
      <span class="logo">
        <a
          href="https://github.com/lqrDream/visual"
          title=""
          target="_blank"
        >github</a>
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <span class="qiehuan" @click="handleChangeTheme">切换主题</span>
        <div class="datetime">{{ systemTime }}</div>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="{ fullscreen: fullScreenStatus.trend }">
          <!-- 销量趋势图表 -->
          <trend ref="trend"></trend>
          <div class="resize">
            <!-- icon-compress-alt 向内 -->
            <span
              @click="changeSize('trend')"
              :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div id="left-bottom" :class="{ fullscreen: fullScreenStatus.seller }">
          <!-- 商家销售金额图表 -->
          <seller ref="seller"></seller>
          <div class="resize">
            <span
              @click="changeSize('seller')"
              :class="['iconfont', fullScreenStatus.seller ? 'icon-compress-alt' : 'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="{ fullscreen: fullScreenStatus.map }">
          <!-- 商家分布图表 -->
          <single-map ref="map"></single-map>
          <div class="resize">
            <span
              @click="changeSize('map')"
              :class="['iconfont', fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div id="middle-bottom" :class="{ fullscreen: fullScreenStatus.rank }">
          <!-- 地区销量排行图表 -->
          <rank ref="rank"></rank>
          <div class="resize">
            <span
              @click="changeSize('rank')"
              :class="['iconfont', fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="{ fullscreen: fullScreenStatus.hot }">
          <!-- 热销商品占比图表 -->
          <hot ref="hot"></hot>
          <div class="resize">
            <span
              @click="changeSize('hot')"
              :class="['iconfont', fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div id="right-bottom" :class="{ fullscreen: fullScreenStatus.stock }">
          <!-- 库存销量分析图表 -->
          <stock ref="stock"></stock>
          <div class="resize">
            <span
              @click="changeSize('stock')"
              :class="['iconfont', fullScreenStatus.stock ? 'icon-compress-alt' : 'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'
import * as dayjs from 'dayjs'
export default {
  name: 'ScreenPage',
  components: {
    Hot,
    'single-map': Map,
    Rank,
    Seller,
    Stock,
    Trend
  },
  data () {
    return {
      // 各组件是否全屏状态
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false
      },
      // 当前的系统时间
      systemDateTime: null,
      // 用于保存当前系统日期的定时器id
      timerID: null,
      systemTime: 0
    }
  },
  created () {
    this.$socket.registerCallback('fullScreen', this.recvData)
    this.$socket.registerCallback('themeChange', this.recvThemeChange)
  },
  mounted () {
    dayjs.locale('es')
    this.systemTime = dayjs().format('YYYY-MM-DD')
  },
  unmounted () {
    this.$socket.unregisterCallback('fullScreen')
    this.$socket.unregisterCallback('themeChange')
  },
  methods: {
    changeSize (item) {
      // 全屏 / 缩小
      // this.fullScreenStatus[item] = !this.fullScreenStatus[item]
      // // 全屏自适应
      // this.$nextTick(() => {
      //   this.$refs[item].screenAdapter()
      // })

      // 讲数据发送给服务器
      const targetValue = !this.fullScreenStatus[item]
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName: item,
        value: targetValue
      })
    },
    // 接收到全屏数据之后处理
    recvData (item) {
      // 取出要切换的图片
      const chartName = item.chartName
      // 去除切换的状态
      const targetValue = item.value
      this.fullScreenStatus[chartName] = targetValue
      this.$nextTick(() => {
        this.$refs[chartName].screenAdapter()
      })
    },
    // 改变主题
    handleChangeTheme () {
      // console.log('sss', this)
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },
    // 收到服务器的数据 改变主题
    recvThemeChange () {
      this.$store.commit('changeTheme')
    }
  }
}
</script>
<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 9999;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 80px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    a {
      text-decoration: none;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
