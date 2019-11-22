import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from "classnames"
import "./refresh.scss"
import utils from './utils'

class Refresh extends Component {
  static childContextTypes = {
    scroller: PropTypes.object
  }

  getChildContext() {
    return { scroller: this }
  }

  componentDidMount() {
    console.log(this.scroller)
  }

  render() {
    return (
      <div
        className={cs(
          'silk-listcontrol-wrapper',
          {
            'silk-listcontrol-wrapper-default': true
          }
        )}
        
        ref={ref => { this.wrapper = ref }}
      >
        <div
          className={cs(
            'silk-listcontrol-scroller',
            {
              'silk-listcontrol-scroller-vertical': true
            },
          )}
          ref={ref => { this.scroller = ref }}
        >
          <div
          ref={ref => { this.pullRefreshEl = ref }}
          className="silk-listcontrol-loadwrapper silk-listcontrol-loadwrapper-up"
        >
          <div className="silk-listcontrol-loadtip">
            <i className="silk-listcontrol-icon" />
            <div className="silk-listcontrol-text" />
          </div>
        </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Refresh