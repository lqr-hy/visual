<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>
<script>
import { shallowRef } from 'vue'
import { mapState } from 'vuex'
export default {
  name: 'stock',
  data () {
    return {
      stockInit: null,
      stockData: null,
      currentIndex: 0,
      timer: null,
      titleSize: null,
      innnerRadius: 100,
      outterRadius: 110
    }
  },
  created () {
    // 注册回掉函数
    this.$socket.registerCallback('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted () {
    this.$socket.unregisterCallback('stockData')
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timer)
  },
  methods: {
    // 初始化数据
    initChart () {
      this.stockInit = shallowRef(this.$echarts.init(this.$refs.stock_ref, this.theme))
      const initOption = {
        title: {
          text: '库存销量分析',
          top: 20,
          left: 20
        }
      }
      this.stockInit.setOption(initOption)
    },
    // 获取数据
    getData (ret) {
      // const { data } = await this.$http('/stock')
      this.stockData = ret
      this.updateChart()
      this.startInterval()
    },
    // 更新数据
    updateChart () {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['83%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      // 分批显示
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const batches = this.stockData && this.stockData.slice(start, end)
      const seriesArr = batches.map((item, index) => {
        return {
          type: 'pie',
          radius: [this.outterRadius, this.innnerRadius],
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移入的时候动画效果
          labelLine: {
            show: false
          },
          label: {
            position: 'inner'
            // position: 'center'
          },
          data: [
            {
              name: item.name + '\n' + item.sales,
              value: item.sales
            },
            {
              value: item.stock
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.stockInit.setOption(dataOption)
    },
    // 屏幕自适应
    screenAdapter () {
      this.titleSize = this.$refs.stock_ref.offsetWidth / 100 * 3.6
      this.innnerRadius = this.titleSize * 2.8
      this.outterRadius = this.innnerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [this.outterRadius, this.innnerRadius],
            label: {
              fontSize: this.titleSize / 2
            }
          },
          {
            radius: [this.outterRadius, this.innnerRadius],
            label: {
              fontSize: this.titleSize / 2
            }
          },
          {
            radius: [this.outterRadius, this.innnerRadius],
            label: {
              fontSize: this.titleSize / 2
            }
          },
          {
            radius: [this.outterRadius, this.innnerRadius],
            label: {
              fontSize: this.titleSize / 2
            }
          },
          {
            radius: [this.outterRadius, this.innnerRadius],
            label: {
              fontSize: this.titleSize / 2
            }
          }
        ]
      }
      this.stockInit.setOption(adapterOption)
      this.stockInit.resize()
    },
    // 定时切换
    startInterval () {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 5000)
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      // 销毁当前图表
      this.stockInit.dispose()
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
