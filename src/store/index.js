import { createStore } from 'vuex'

export default createStore({
  state: {
    theme: 'chalk'
  },
  mutations: {
    changeTheme (state) {
      if (state.theme === 'chalk') {
        this.state.theme = 'purple-passion'
      } else {
        this.state.theme = 'chalk'
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
