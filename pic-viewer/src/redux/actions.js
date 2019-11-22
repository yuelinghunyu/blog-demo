const CLOSE_PIC_VIEWER = 'CLOSE_PIC_VIEWER'

const boundClosePicViewer = (data) => {
  return (dispatch) => {
    dispatch({
      type: CLOSE_PIC_VIEWER,
      data
    })
  }
  
}

export {
  boundClosePicViewer
}