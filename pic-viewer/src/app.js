import "./app.scss";
import React, { Component } from 'react'
import PicViewer from "@/component/pic-viewer"
import store from '@/redux/index'
import Scroll from '@/component/scroll/scroll'

class App extends Component{
    constructor(){
        super()
        this.state={
            list: [
                require("#/img/turu1.jpg"),
                require("#/img/turu2.jpg"),
                require("#/img/turu3.jpg"),
                require("#/img/turu4.jpg"),
                require("#/img/turu5.jpg"),
                require("#/img/turu6.jpg")
            ]
        }
        this.handlePicViewer = this.handlePicViewer.bind(this)
        this.initStore()
    }
    initStore(){
        store.subscribe(() => {
            const state = store.getState()
            const closePicViewer = state.close_pic_viewer
            if(closePicViewer) {
                PicViewer.closePicViewer()
            }
        })
    }
    handlePicViewer(ev, index) {
        PicViewer.showPicViewer({
            urlList: this.state.list,
            currentIndex: index
        })
    }
    render(){
        return(
            <Scroll>
                <div className='app-container'>
                    {
                        this.state.list.length ?
                        this.state.list.map((url, index) => {
                            return (
                                <img 
                                    key={index}
                                    src={url} 
                                    onClick={(ev) => { this.handlePicViewer(ev, index) }}
                                />
                            )
                        }): null
                    }
                </div>
            </Scroll>    
        )
    }
}
export default App