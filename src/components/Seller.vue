<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref">
      seller
    </div>
  </div>
</template>
<script>
import '../utils/chalk'
import '../utils/purple-passion'
import '../utils/westeros.js'
import { shallowRef } from 'vue'
import { mapState } from 'vuex'
export default {
  name: 'Seller',
  data () {
    return {
      sellerInit: null,
      chartData: [],
      currentPage: 3, // 当前页
      totalPage: 0, // 一共多少页
      timeId: null // 定时器
    }
  },
  created () {
    // 注册回掉函数
    this.$socket.registerCallback('sellerData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted () {
    this.$socket.unregisterCallback('sellerData')
    clearInterval(this.timeId)
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    initChart () {
      this.sellerInit = shallowRef(this.$echarts.init(this.$refs.seller_ref, this.theme))
      this.sellerInit.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.sellerInit.on('mouseout', () => {
        this.startInterval()
      })
      // 初始化options
      const initOption = {
        title: {
          text: '商家销售量统计',
          left: 20,
          top: 20
        },
        grid: {
          top: '20%',
          left: '3%',
          bottom: '3%',
          right: '8%',
          containLabel: true // 包含坐标轴文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'item',
          z: 0,
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: '#fff'
              }
            },
            itemStyle: {
              borderRadius: [0, 33, 33, 0],
              // 颜色渐变
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.sellerInit.setOption(initOption)
    },
    getData (ret) {
      // const { data } = await this.$http('seller')
      this.chartData = ret
      this.chartData.sort((a, b) => {
        return a.value - b.value
      })
      this.totalPage = this.chartData % 5 === 0 ? this.chartData.length / 5 : this.chartData.length / 5 + 1
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },
    updateChart () {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.chartData.slice(start, end)
      const sellerNames = showData.map(item => item.name)
      const sellerValues = showData.map(item => item.value)
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }

      this.sellerInit.setOption(dataOption)
    },
    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentPage++
        if (this.currentPage >= this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    screenAdapter () {
      const titleSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      const screenOption = {
        title: {
          textStyle: {
            fontSize: titleSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleSize
            }
          }
        },
        series: [
          {
            barWidth: titleSize,
            itemStyle: {
              borderRadius: [0, titleSize / 2, titleSize / 2, 0]
            }
          }
        ]
      }
      this.sellerInit.setOption(screenOption)
      this.sellerInit.resize()
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      // 销毁当前图表
      this.sellerInit.dispose()
      // 以新图表开始实例化
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 跟新数据
      this.updateChart()
    }
  }
}
</script>
<style lang="less">
</style>
