import vueTimePlay from './vue-time-play' // 导入组件
const timePlay = {
  install (Vue, options) {
    Vue.component(vueTimePlay.name, vueTimePlay)  // vueTimePlay.name 组件的name属性
    // 类似通过 this.$xxx 方式调用插件的 其实只是挂载到原型上而已
    // Vue.prototype.$xxx  // 最终可以在任何地方通过 this.$xxx 调用
  }
}
export default timePlay // 导出..
