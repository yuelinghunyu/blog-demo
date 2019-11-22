import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import store from '@/redux/index'
import classNames from 'classnames'
import { boundClosePicViewer } from '@/redux/actions'
import Swiper from 'swiper'
import "swiper/css/swiper.min.css"
import Hammer from 'hammerjs'
import VConsole from 'vconsole/dist/vconsole.min.js'
import "./pic-viewer.scss"
import { getStyle } from "@/plugin/utils"
new VConsole()


class PicViewer extends Component{
  constructor(props){
    super(props)
    this.state = {
      hammerList: [],
      swiperSlideImg: [],
      slideImgWidth: [],
      slideImgHeight: [],
      originWidth: 0,
      currentScale: 1,
      rate: 0.05,
      currentCenter: "50%"
    }
    this.handleCloseEvent = this.handleCloseEvent.bind(this)
    this.handleMaxEvent = this.handleMaxEvent.bind(this)
    this.handleMinEvent = this.handleMinEvent.bind(this)
    this.picLoaded = this.picLoaded.bind(this)
  }

  componentDidMount(){
    // 初始化swiper
    new Swiper(ReactDOM.findDOMNode(this.swiper), {
      initialSlide: this.props.currentIndex
    })
    // 初始化slide 和 img
    const swiperSlide = document.getElementsByClassName("swiper-slide")
    const swiperSlideImg = document.getElementsByClassName("swiper-slide-img")
    const hammerList = []
    Array.from(swiperSlide).forEach(slide => {
      const hammer = new Hammer(slide)
      hammer.get('pan').set({enable: true})
      hammer.get('pinch').set({enable: true})
      hammerList.push(hammer)
    })
    this.setState({
      hammerList: hammerList,
      swiperSlideImg: swiperSlideImg,
      originWidth: swiperSlide[0].clientWidth
    }, () => {
      console.log(this.state.originWidth)
      this.updateCurrentDOM()
    })
   
  }
  // 更新当前的相关dom
  updateCurrentDOM(){
    this.updateGestrueEvent(
      this.state.hammerList[this.props.currentIndex],
      this.state.swiperSlideImg[this.props.currentIndex]
    )
  }
  // 监听当前dom的手势事件
  updateGestrueEvent(hammer, currentImg) {
    hammer.on("panmove", (ev) => {
      const delatX = ev.deltaX + 'px'
      const delatY = ev.deltaY + 'px'
      this.handleImgMove(delatX, delatY, currentImg)
    })
    hammer.on('pinchin', (ev) => {
      const x = ev.center.x + 'px'
      this.setState({
        currentCenter: x,
        currentScale: this.state.currentScale - this.state.rate > 1 ? this.state.currentScale - this.state.rate : 1
      }, () => {
        this.handleImgSize(
          this.state.currentScale,
          this.state.swiperSlideImg[this.props.currentIndex],
          this.state.currentCenter
        )
      })
    })
    hammer.on('pinchout', (ev) => {
      const x = ev.center.x + 'px'
      this.setState({
        currentCenter: x,
        currentScale: this.state.currentScale + this.state.rate
      }, () => {
        this.handleImgSize(
          this.state.currentScale,
          this.state.swiperSlideImg[this.props.currentIndex],
          this.state.currentCenter
        )
      })
    })
  }
  handleImgSize(scale, currentImg, center) {
    currentImg.style.transformOrigin = center + ' 50%'
    currentImg.style.transform = 'scale(' + scale + ')'
  }
  handleImgMove(x, y, currentImg) {
    // currentImg.style.transform = 'translate('+ x + ','+ y +')'
    // console.log('translate('+ x + ','+ y +')')
    currentImg.style.left = x
    currentImg.style.top = y
  }
  picLoaded(index){
    // 获取当前图片的宽高度集合
    this.state.slideImgWidth.push(this.state.swiperSlideImg[index].clientWidth)
    this.state.slideImgHeight.push(this.state.swiperSlideImg[index].clientHeight)
  }
  // 关闭遮罩层
  handleCloseEvent(){
    store.dispatch(boundClosePicViewer(true))
  }
  // 点击放大按钮，图片进行缩放
  handleMaxEvent(){
    this.setState({
      currentScale: this.state.currentScale + this.state.rate
    }, () => {
      this.handleImgSize(
        this.state.currentScale,
        this.state.swiperSlideImg[this.props.currentIndex],
        this.state.currentCenter
      )
    })
  }
  handleMinEvent(){
    this.setState({
      currentScale: this.state.currentScale - this.state.rate > 1 ? this.state.currentScale - this.state.rate : 1
    }, () => {
      this.handleImgSize(
        this.state.currentScale,
        this.state.swiperSlideImg[this.props.currentIndex],
        this.state.currentCenter
      )
    })
  }
  render(){
    let { urlList } = this.props
    return(
      <div className="pic-viewer_container">
        <span 
          className="pic-viewer_close iconfont icon-guanbi"
          onClick={this.handleCloseEvent}
        ></span>
        <div 
          className="pic-viewer_swiper-container"
          ref={el => this.swiper = el}
        >
          <div className="swiper-wrapper">
          {
            urlList.length ?
            urlList.map((url, index) => {
              return(
                <div 
                  className={classNames("swiper-slide", {'swiper-no-swiping': true})}
                  key={index}
                >
                  <img
                    className="swiper-slide-img"
                    src={url}
                    onLoad={() => { this.picLoaded(index) }}
                  />
                </div>
              )
            }): null
          }
          </div>
        </div>
        <div className="pic-viewer_operate">
          <span
            className="pic-viewer_operate-scale"
          >
            <i 
              className="iconfont icon-jia"
              // onClick={this.handleMaxEvent}
            ></i>
            <i 
              className="iconfont icon-jian"
              // onClick={this.handleMinEvent}
            ></i>
          </span>
        </div>
      </div>
    )
  }
}
PicViewer.propTypes = {
  urlList: PropTypes.array,
  currentIndex: PropTypes.number
}

PicViewer.instance = (option) => {
  let props = option || {}
  let div = document.createElement("div")
  div.className="pic-viewer"
  document.body.appendChild(div)
  ReactDOM.render(React.createElement(PicViewer, props), div)
  return {
    destroy() {
      ReactDOM.unmountComponentAtNode(div)
      document.body.removeChild(div)
    }
  }
}
export default PicViewer