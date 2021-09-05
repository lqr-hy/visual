<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="left" @click="handlPrev"></span>
    <span class="right" @click="handlNext"></span>
    <span class="title" :style="getSize">{{getName }}</span>
  </div>
</template>
<script>
import { shallowRef } from 'vue'
import { mapState } from 'vuex'
export default {
  name: 'Hot',
  data () {
    return {
      hotInit: null,
      hotData: null,
      currentIndex: 0, // 当前显示的
      titleSize: 0
    }
  },
  created () {
    // 注册回掉函数
    this.$socket.registerCallback('hotData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  unmounted () {
    this.$socket.unregisterCallback('hotData')
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化数据
    initChart () {
      this.hotInit = shallowRef(this.$echarts.init(this.$refs.hot_ref, this.theme))
      const initOption = {
        title: {
          text: '热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          bottom: '5%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            // console.log(arg)
            let total = 0
            arg.data.children.forEach(item => {
              total += item.value
            })

            let str = ''
            arg.data.children.forEach(item => {
              str += `
                ${item.name}: ${parseInt(item.value / total * 100) + '%'}  <br>
              `
            })
            return str
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.hotInit.setOption(initOption)
    },
    // 获取数据
    async getData (ret) {
      // const { data } = await this.$http('/hotproduct')
      // console.log(data)
      this.hotData = ret
      this.updateChart()
    },
    // 更新数据
    updateChart () {
      // 图例数据
      const legendData = this.hotData && this.hotData[this.currentIndex].children.map(item => item.name)
      // 显示数据
      const seriesData = this.hotData && this.hotData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.hotInit.setOption(dataOption)
    },
    // 屏幕自适应
    screenAdapter () {
      this.titleSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleSize
          }
        },
        legend: {
          itemWidth: this.titleSize / 2,
          itemHeight: this.titleSize / 2,
          itemGap: this.titleSize / 2,
          itemStyle: {
            fontSize: this.titleSize
          }
        },
        series: [
          {
            radius: this.titleSize * 4.5,
            center: ['50%', '50%']
          }
        ]
      }
      this.hotInit.setOption(adapterOption)
      this.hotInit.resize()
    },
    // 上一个
    handlPrev () {
      if (this.currentIndex === 0) {
        this.currentIndex = this.hotData.length - 1
      }
      this.currentIndex--
    },
    // 下一个
    handlNext () {
      if (this.currentIndex === this.hotData.length - 1) {
        this.currentIndex = 0
      }
      this.currentIndex++
    }
  },
  watch: {
    currentIndex: {
      handler (val, oldVal) {
        if (val !== oldVal) {
          this.updateChart()
        }
      }
    },
    theme () {
      // 销毁当前图表
      this.hotInit.dispose()
      // 以新图表开始实例化
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 跟新数据
      this.updateChart()
    }
  },
  computed: {
    getName () {
      if (!this.hotData) {
        return ''
      } else {
        return this.hotData[this.currentIndex].name
      }
    },
    getSize () {
      return {
        fontSize: this.titleSize + 'px'
      }
    },
    ...mapState(['theme'])
  }
}
</script>
<style lang="less" scoped>
.left {
  position: absolute;
  top: 50%;
  left: 10%;
  font-size: 24px;
  // color: #fff;
  background-color: #fff;
  height: 50px;
  width: 30px;
  clip-path: polygon(100% 0, 80% 0, 0% 50%, 80% 100%, 100% 100%, 20% 50%);
  cursor: pointer;
  transform: translateY(-50%);
}
.right {
  position: absolute;
  top: 50%;
  right: 10%;
  font-size: 24px;
  background-color: #fff;
  height: 50px;
  width: 30px;
  clip-path: polygon(0 0, 20% 0, 100% 50%, 20% 100%, 0 100%, 80% 50%);
  cursor: pointer;
  transform: translateY(-50%);
}
.title {
  position: absolute;
  left: 80%;
  top: 40px;
  color: #fff;
}
</style>
