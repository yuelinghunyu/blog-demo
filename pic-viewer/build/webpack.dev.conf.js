/**
 * author: jdj
 */
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
// 引用基础文件
const webpackConfigBase = require('./webpack.base.conf')
// 运行时配置
const webpackConfigDev = {
    mode: 'development', // 通过 mode 声明开发环境
    output: {
        path: path.resolve(__dirname, '../mso'),
        filename: 'static/js/[name].bundle.js'
    },
    devServer: {
        contentBase: path.join(__dirname, "../src"),
        publicPath:'/',
		host: "localhost",
        port: "8090",
        overlay: true, // 浏览器页面上显示错误
		// open: true, // 开启浏览器
		// stats: "errors-only", //stats: "errors-only"表示只打印错误：
		hot: true, // 开启热更新
		//服务器代理配置项
        proxy: {
            '/mso/*':{
                target: 'https://www.baidu.com',
                secure: true,
                changeOrigin: true
            }
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), //热更新
    ],
    devtool: "source-map",  // 开启调试模式
	module: {
		rules: []
	},
}
module.exports = merge(webpackConfigBase, webpackConfigDev)