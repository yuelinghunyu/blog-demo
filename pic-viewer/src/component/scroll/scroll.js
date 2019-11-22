import React, { Component } from 'react'
import { stylePrefix, getStyle } from "@/plugin/utils"
import "./scroll.scss"

class Scroll extends Component {
  constructor(props) {
    super(props)
    this.state = {
      start: 0,
      last_distance: 0,
      boundary: 600,
      loading_boundary: 200,
      loading_top: 0,
      loading_status: 0
    }
    this.handleStart = this.handleStart.bind(this)
    this.handleMove = this.handleMove.bind(this)
    this.handleEnd = this.handleEnd.bind(this)
  }
  render(){
    return(
      <div className="scroll-container">
        <div 
          className="loading-container"
          ref={el => this.loading = el}
        >
          <div className="loading-tips">
            {
              this.state.loading_status ?
              (this.state.loading_status === 1 ? "松开刷新" : "正在加载") :
              "下拉刷新"
            }
          </div>
        </div>
        <div 
          className="scroll-swrapper"
          onTouchStart={this.handleStart}
          onTouchMove={this.handleMove}
          onTouchEnd={this.handleEnd}
          ref={el => this.swrapper = el}
        >
          {this.props.children}
        </div>
      </div>
    )
  }

  handleStart(ev) {
    console.log("开始")
    this.setState({
      start: ev.changedTouches[0].pageY,
      loading_top: -50
    })
  }
  handleMove(ev) {
    console.log("移动")
    const cur_move = ev.changedTouches[0].pageY - this.state.start
    const move_distance = this.state.last_distance + cur_move
    if(move_distance <= this.state.boundary) {
      this.swrapper.style[stylePrefix('transform')] = `translateY(${0.3 * move_distance}px)`
      this.swrapper.style[stylePrefix('transitionDuration')] = '0ms'
    }
    console.log(move_distance <= this.state.loading_boundary)
    if(move_distance <= this.state.loading_boundary) {
      this.loading.style.top = `${(0.3 * move_distance + this.state.loading_top)}px`
      this.loading.style[stylePrefix('transitionDuration')] = '0ms'
    } else {
      this.setState({
        loading_status: 1
      })
    }
  }
  handleEnd(ev) {
    console.log("结束")
    const cur_move = ev.changedTouches[0].pageY - this.state.start;
    // this.setState({
    //   last_distance: this.state.last_distance + cur_move
    // }, () => {
    //   if(this.state.last_distance) {
    //     this.swrapper.style[stylePrefix('transform')] = 'translateY(80px)'
    //     this.swrapper.style[stylePrefix('transitionDuration')] = '400ms'
    //     this.setState({
    //       loading_status: 2,
    //       last_distance: 0
    //     })
    //     const timer = setTimeout(() => {
    //       this.swrapper.style[stylePrefix('transform')] = 'translateY(0px)'
    //       this.swrapper.style[stylePrefix('transitionDuration')] = '400ms'
    //       this.loading.style.top = `${this.state.loading_top}px`
    //       this.loading.style[stylePrefix('transitionDuration')] = '400ms'
    //       clearTimeout(timer)
    //     }, 3000)
    //   }
    // })
    
  }
}

export default Scroll