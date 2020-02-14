const IScroll = require('iscroll')
const VIScroll = {
  install: function (Vue, options) {
    Vue.directive('iscroll', {
      inserted: function (el, binding, vnode) {
        let callBack
        let iscrollOptions = options
        const option = binding.value && binding.value.option
        const func = binding.value && binding.value.instance
        // 判断输入参数
        const optionType = option ? [].toString.call(option) : undefined
        const funcType = func ? [].toString.call(func) : undefined
        // 兼容 google 浏览器拖动
        el.addEventListener('touchmove', function (e) {
          e.preventDefault()
        })
        // 将参数配置到new IScroll(el, iscrollOptions)中
        if (optionType === '[object Object]') {
          iscrollOptions = option
        }
        if (funcType === '[object Function]') {
          callBack = func
        }
        // 使用vnode绑定iscroll是为了让iscroll对象能够夸状态传递，避免iscroll重复建立
        // 这里面跟官方网站 const myScroll = new IScroll('#wrapper'，option) 初始化一样
        vnode.scroll = new IScroll(el, iscrollOptions)
        // 如果指令传递函数进来，把iscroll实例传递出去
        if (callBack) callBack(vnode.scroll)
      },
      componentUpdated: function (el, binding, vnode, oldVnode) {
        // 将scroll绑定到新的vnode上，避免多次绑定
        vnode.scroll = oldVnode.scroll
        // 使用 settimeout 让refresh跳到事件流结尾，保证refresh时数据已经更新完毕
        setTimeout(() => {
          vnode.scroll.refresh()
        }, 0)
      },
      unbind: function (el, binding, vnode, oldVnode) {
        // 解除绑定时要把iscroll销毁
        vnode.scroll = oldVnode.scroll
        vnode.scroll.destroy()
        vnode.scroll = null
      }
    })
  }
}
module.exports = VIScroll