import Layer from './layer'

const layer = {}

layer.install = (vue) => {
  let layerComponent = null
  const layerInstance = vue.extend(Layer)
  const instance = () => {
    layerComponent = new layerInstance()
    const layerEl = layerComponent.$mount().$el
    document.getElementById("app").appendChild(layerEl)
  }
  vue.prototype.$layer = {
    show (option) {
      instance()
      Object.assign(layerComponent, option)
    },
    hide () {
      if (layerComponent) {
        const layerEl = layerComponent.$mount().$el
        document.getElementById("app").removeChild(layerEl)
      }
    }
  }
}

export default layer