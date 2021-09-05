/* eslint-disable */
export default class SocketService {
  static instance = null
  static get Instance () {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务器连接的对象
  ws = null
  isConnectSuccess = false
  callBackMapping = {}
  // send 的次数
  reqConnectCount = 0
  // 重新连接的次数
  connectRetryCount = 0
  // 定义服务器的方法
  connect () {
    if (!window.WebSocket) {
      return console.log('当前浏览器版本过低')
    }
    this.ws = new WebSocket('ws://localhost:9998')

    // 连接成功
    this.ws.onopen = () => {
      console.log('connect success')
      this.isConnectSuccess = true
      this.connectRetryCount = 0
    }

    // 连接失败
    this.ws.onclose = () => {
      console.log('connect error')
      this.isConnectSuccess = true
      // 服务器可能出现连接失败的情况 隔一段时间去请求 
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, this.connectRetryCount * 500);
    }

    // 得到服务器发送的数据
    this.ws.onmessage = (msg) => {
      // console.log('获取数据')
      // console.log(msg.data)
      // 判断数据的类型
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType

      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        // 判断交互类型
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          this.callBackMapping[socketType].call(this, recvData)
        } else if (action === 'themeChange') {
          this.callBackMapping[socketType].call(this, recvData)
        }
      }
    }
  }

  // 回掉函数注册
  registerCallback (socketType, callback) {
    this.callBackMapping[socketType] = callback
  }

  // 回掉函数的取消
  unregisterCallback (socketType) {
    this.callBackMapping[socketType] = null
  }

  send (data) {
    if (this.isConnectSuccess) {
      this.reqConnectCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      // 因为websocket 连接是异步
      this.reqConnectCount++
      setTimeout(() => {
        this.send(data)
      }, this.reqConnectCount * 500)
    }
  }
}
