import React from 'react';
import ReactDOM from 'react-dom';
import "@babel/polyfill"
import "@/plugin/flexible"
import "#/common/reset.scss"
import "#/font/iconfont.css"
import App from './app';

ReactDOM.render(<App />,document.getElementById("root"))