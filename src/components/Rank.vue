<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>
<script>
import { shallowRef } from 'vue'
import { mapState } from 'vuex'
export default {
  name: 'Rank',
  data () {
    return {
      rankInit: null,
      rankData: null,
      startValue: 0,
      endValue: 9,
      timer: null
    }
  },
  created () {
    // 注册回掉函数
    this.$socket.registerCallback('rankData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted () {
    this.$socket.unregisterCallback('rankData')
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timer)
  },
  watch: {
    startValue (val, oldVal) {
      if (val !== oldVal) {
        this.updateChart()
      }
    },
    theme () {
      // 销毁当前图表
      this.rankInit.dispose()
      // 以新图表开始实例化
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 跟新数据
      this.updateChart()
    }
  },
  methods: {
    // 初始化数据
    initChart () {
      this.rankInit = shallowRef(this.$echarts.init(this.$refs.rank_ref, this.theme))
      const initOption = {
        title: {
          text: '地区销量',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '10%'
        },
        xAxis: {
          type: 'category'
        },
        tooltip: {
          show: true
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }
      this.rankInit.setOption(initOption)

      this.rankInit.on('mouseover', () => {
        clearInterval(this.timer)
      })

      this.rankInit.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取数据
    getData (ret) {
      // const { data } = await this.$http('/rank')
      // 数据从大到小
      ret.sort((a, b) => b.value - a.value)
      this.rankData = ret
      this.updateChart()
      this.startInterval()
    },
    // 更新数据
    updateChart () {
      // 颜色渐变数组
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72Bf', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      // 所有省份形成的数组
      const provinceArr = this.rankData && this.rankData.map(item => item.name)
      // 所有省份对应的销售金额
      const valueArr = this.rankData && this.rankData.map(item => item.value)
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: arg => {
                let tarrgetColor = null
                if (arg.value > 300) {
                  tarrgetColor = colorArr[0]
                } else if (arg.value > 200) {
                  tarrgetColor = colorArr[1]
                } else {
                  tarrgetColor = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: tarrgetColor[0]
                  },
                  {
                    offset: 1,
                    color: tarrgetColor[1]
                  }
                ])
              }
            }
          }
        ]
      }
      this.rankInit.setOption(dataOption)
    },
    // 屏幕自适应
    screenAdapter () {
      const titleSize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleSize
          }
        },
        series: [
          {
            barWidth: titleSize,
            itemStyle: {
              borderRadius: [titleSize / 2, titleSize / 2, 0, 0]
            }
          }
        ]
      }
      this.rankInit.setOption(adapterOption)
      this.rankInit.resize()
    },
    startInterval () {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.rankData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
      }, 2000)
    }
  },
  computed: {
    ...mapState(['theme'])
  }
}
</script>
<style lang="less">
</style>
