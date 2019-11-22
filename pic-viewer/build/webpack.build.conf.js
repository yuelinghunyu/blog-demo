const path = require('path');
const merge = require("webpack-merge");
const safeParser = require('postcss-safe-parser')
// 清除打包的目录等
const cleanWebpackPlugin = require("clean-webpack-plugin")
// 对js文件进行处理 压缩
const uglifyJSPlugin = require('uglifyjs-webpack-plugin')
// 对css文件进行处理
const optimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// js和css 分离
const extractTextPlugin = require('extract-text-webpack-plugin')
// 引用webpack.base.conf.js
const webpackConfigBase = require('./webpack.base.conf')
// 获取打包路径
const rootPath = 
	require('./relate.conf').relate.envs === "test"
	? require('./relate.conf').relate.rootPath.test
	: require('./relate.conf').relate.rootPath.pro
// 生产webpack 打包配置
const webpackConfigProd = {
    mode: 'production', // 通过 mode 声明生产环境
    output: {
		path: path.resolve(__dirname, '../mso'),
		filename: 'static/js/[name].[hash].js', // 打包多出口文件
		publicPath: rootPath
    },
    devtool: 'cheap-module-eval-source-map',
    plugins: [
		//删除mso目录
		new cleanWebpackPlugin(['mso'], {
			root: path.resolve(__dirname, '../'), //根目录
			// verbose Write logs to console.
			verbose: true, //开启在控制台输出信息
			// dry Use boolean "true" to test/emulate delete. (will not remove files).
			// Default: false - remove files
			dry: false,
		}),
		// 分离css插件参数为提取出去的路径
		new extractTextPlugin({
			filename: 'static/css/[name].[hash:8].min.css',
		}),
		//压缩css
		new optimizeCSSPlugin({
			cssProcessorOptions: {
				parser: safeParser,
                discardComments: {
                    removeAll: true
                }
			}
		}),
		//上线压缩 去除console等信息webpack4.x之后去除了webpack.optimize.UglifyJsPlugin
		new uglifyJSPlugin({
			uglifyOptions: {
				compress: {
					warnings: false,
					drop_debugger: false,
					drop_console: true
				}
			}
		})
	],
	module: {
		rules: []
	},
}
module.exports = merge(webpackConfigBase, webpackConfigProd)