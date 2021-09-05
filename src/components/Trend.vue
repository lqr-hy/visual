<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{showTitle}}</span>
      <i class="iconfont icon-arrow-down" :style="comStyle" @click="showChioce = !showChioce"></i>
      <div class="select-title" v-show="showChioce">
        <div class="select-item" v-for="item in selectType" :key="item.key" @click="changType(item.key)">
          {{item.text}}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>
<script>
import { shallowRef } from 'vue'
import { mapState } from 'vuex'
const unwarp = (obj) => obj && (obj.__v_raw || obj.valueOf() || obj)
export default {
  name: 'Trend',
  data () {
    return {
      trendInit: null,
      trendData: null,
      showChioce: false,
      choiceType: 'map',
      titleSize: 0
    }
  },
  created () {
    // 注册回掉函数
    this.$socket.registerCallback('trendData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    // 发送数据
    // console.log(shallowRef(this.$socket.send))
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted () {
    this.$socket.unregisterCallback('trendData')
    window.removeEventListener('resize', this.screenAdapter)
  },
  computed: {
    selectType () {
      if (this.trendData) {
        return this.trendData.type.filter(item => item.key !== this.choiceType)
      } else {
        return []
      }
    },
    showTitle () {
      if (!this.trendData) {
        return ''
      } else {
        return this.trendData[this.choiceType].title
      }
    },
    comStyle () {
      return {
        fontSize: this.titleSize + 'px'
      }
    },
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      // 销毁当前图表
      this.trendInit.dispose()
      // 以新图表开始实例化
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 跟新数据
      this.updateChart()
    }
  },
  methods: {
    initChart () {
      // 加了shallowRef 会解决屏幕适配的时候出现显示问题
      this.trendInit = shallowRef(this.$echarts.init(this.$refs.trend_ref, this.theme))
      const initOption = {
        grid: {
          left: '3%',
          top: '35%',
          bottom: '1%',
          right: '8%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255,255,255,0.8)'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      unwarp(this.trendInit).setOption(initOption)
    },
    // async getData () {
    //   const { data } = await this.$http.get('trend')
    //   this.trendData = data
    //   this.updateChart()
    // },
    // 服务器发送回来的数据
    getData (ret) {
      console.log('获取到数据了', ret)
      this.trendData = ret
      this.updateChart()
    },
    updateChart () {
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      const colorArr2 = [
        'rgba(11, 168, 44, 1)',
        'rgba(44, 110, 255, 1)',
        'rgba(22, 242, 217, 1)',
        'rgba(254, 33, 30, 1)',
        'rgba(250, 105, 0, 1)'
      ]

      const timeArr = this.trendData.common.month
      const valueArr = this.trendData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.choiceType,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => item.name)
      const updataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      unwarp(this.trendInit).setOption(updataOption)
    },
    screenAdapter () {
      this.titleSize = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      const screenOption = {
        legend: {
          itemWidth: this.titleSize,
          itemHeight: this.titleSize,
          itemGap: this.titleSize,
          textStyle: {
            fontSize: this.titleSize / 1.5
          }
        }
      }
      this.trendInit.setOption(screenOption)
      this.trendInit.resize()
    },
    changType (currentType) {
      this.choiceType = currentType
      this.updateChart()
      this.showChioce = false
    }
  }
}
</script>
<style lang="less" scoped>
.title{
  position: absolute;
  top: 20px;
  left: 20px;
  color: #fff;
  z-index: 10;
  i {
    margin-left: 10px;
  }
}
</style>
