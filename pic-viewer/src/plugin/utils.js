// 获取属性值兼容写法
const getStyle = (obj, attr) => {
  if(obj.currentStyle){ 
    return obj.currentStyle[attr]
  } else{ 
    return document.defaultView.getComputedStyle(obj,null)[attr]
  } 
}
// 设置前端前缀
const stylePrefix = (style) => {
  const styleTest = document.createElement('div').style
  const render = {
    webkit: 'webkitTransform',
    ms: 'msTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    standard: 'transform'
  }

  const getPrefix = (() => {
    for (let key in render) {
      if (styleTest[render[key]] !== undefined) {
        return key
      }
    }
  })()
  if(getPrefix === 'standard') {
    return style
  }
  return getPrefix + style.charAt(0).toUpperCase() + style.substr(1)
}
export {
  getStyle,
  stylePrefix
}