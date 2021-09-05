<template>
  <div class="com-container" @dblclick="backChina">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>
<script>
import { shallowRef } from 'vue'
import { getProvinceMapInfo } from '../utils/map_utils'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Map',
  data () {
    return {
      mapInit: null,
      mapData: null,
      provinceData: {}
    }
  },
  created () {
    // 注册回掉函数
    this.$socket.registerCallback('mapData', this.getData)
  },
  unmounted () {
    this.$socket.unregisterCallback('mapData')
    window.removeEventListener('resize', this.screenAdapter)
  },
  mounted () {
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    this.initChart()
    window.addEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化数据
    async initChart () {
      this.mapInit = shallowRef(this.$echarts.init(this.$refs.map_ref, this.theme))
      const ret = await axios.get('/map/china')
      // 注册地图适量数据
      this.$echarts.registerMap('china', ret.data)
      const initOption = {
        title: {
          text: '商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2e72bf'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.mapInit.setOption(initOption)
      // 地图点击事件
      this.mapInit.on('click', async arg => {
        // arg 可以获取点击的数据
        // 根据点击的数据把中文转英文
        const provice = getProvinceMapInfo(arg.name)
        // 如果数据不存在就重新请求
        if (!this.provinceData[provice.key]) {
          const ret = await this.$http.get(`map/province/${provice.key}`)
          console.log(ret, 'retttt')
          this.provinceData[provice.key] = ret.data
          this.$echarts.registerMap(provice.key, ret.data)
        }
        // 改变当前的地图echart
        const changeOption = {
          geo: {
            map: provice.key
          },
          series: []
        }
        this.mapInit.setOption(changeOption)
      })
    },
    // 获取数据
    getData (ret) {
      // const { data } = await this.$http('map')
      // console.log(data)
      this.mapData = ret
      this.updateChart()
    },
    // 更新数据
    updateChart () {
      // 图例的数据
      const legendArr = this.mapData && this.mapData.map(item => item.name)
      // 散点的数据
      const seriesArr = this.mapData && this.mapData.map(item => {
        // 返回每一个单独的散点数据
        // 如果想再地图中显示散点图，就需要加一个配置，coordinateSystem: geo
        return {
          type: 'effectScatter',
          rippleEffect: { // 涟漪效果
            scale: 5,
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.mapInit.setOption(dataOption)
    },
    // 屏幕自适应
    screenAdapter () {
      const titleSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleSize
          }
        },
        legend: {
          itemWidth: titleSize / 2,
          itemHeight: titleSize / 2,
          itemGap: titleSize / 2,
          textStyle: {
            fontSize: titleSize / 2
          }
        }
      }
      this.mapInit.setOption(adapterOption)
      this.mapInit.resize()
    },
    // 返回中国地图
    backChina () {
      const revetOption = {
        geo: {
          map: 'china'
        }
      }
      this.mapInit.setOption(revetOption)
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      // 销毁当前图表
      this.mapInit.dispose()
      // 以新图表开始实例化
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 跟新数据
      this.updateChart()
    },
    mapRegisterData: {
      handler () {
        this.mapRegisterData && this.initChart()
        this.mapRegisterData && this.updateChart()
      },
      immediate: true
    }
  }
}
</script>
<style lang="less">
</style>
