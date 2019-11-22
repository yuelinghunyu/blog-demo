import PicViewer from "./pic-viewer"

let picViewerInstance = null

let getPicViewerInstance = (option) => {
  picViewerInstance = picViewerInstance || PicViewer.instance(option)
  return picViewerInstance
}

const showPicViewer = (option = {}) => {
  getPicViewerInstance(option)
}

const closePicViewer = () => {
  if(picViewerInstance) {
    picViewerInstance.destroy()
    picViewerInstance = null
  }
}

export default {
  showPicViewer,
  closePicViewer
}