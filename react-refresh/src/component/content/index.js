import React, { Component } from 'react'
import "./content.scss"

import Refresh from "../refresh"

class Content extends Component {
  constructor(props) {
    super(props)
    this.pullRefreshAction = this.pullRefreshAction.bind(this)
  }
  render() {
    return(
      <Refresh>
        <div className="app-content">content</div>
      </Refresh>
      
    )
  }
  pullRefreshAction(resolve) {
    setTimeout(() => {
    }, 2000);
  }
}

export default Content