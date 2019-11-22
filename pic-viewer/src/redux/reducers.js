import defaultState from './state'
import { combineReducers  } from 'redux'

const close_pic_viewer = (state = defaultState.close_pic_viewer, action) => {
  switch(action.type) {
    case 'CLOSE_PIC_VIEWER': return action.data
    default: return state
  }
}

export default combineReducers({
  close_pic_viewer
})