/**
 * author: jdj
 */
// css js 分离
const extractTextPlugin = require('extract-text-webpack-plugin')
// 获取当前编辑环境
const envs = require("./relate.conf").relate.envs
//css loader 分离判断
const cssUsed = envs === 'dev'?
        ["style-loader", "css-loader", "sass-loader", "postcss-loader"]:
        extractTextPlugin.extract({
            fallback: 'style-loader',
            use:["css-loader", "sass-loader", "postcss-loader"],
            publicPath: "../" // css中的基础路径
        })
//less loader 分离判断
const lessUsed = envs === 'dev'?
        ["style-loader", "css-loader", "less-loader"]:
        extractTextPlugin.extract({
            fallback: "style-loader",
			use: ["css-loader", "less-loader"],
			publicPath: "../" // css中的基础路径
        })
const rules = [
    {
        test:/\.(css|scss|sass)$/,
        // 不分离的写法
		// use: ["style-loader", "css-loader",sass-loader"]
		// 使用postcss不分离的写法
		// use: ["style-loader", "css-loader", "sass-loader","postcss-loader"]
		// 此处为分离css的写法
		/*use: extractTextPlugin.extract({
			fallback: "style-loader",
			use: ["css-loader", "sass-loader"],
			// css中的基础路径
			publicPath: "../"
        })*/
        use:cssUsed
    },
    {
        test:/\.js$/,
        use:[{
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-react'],
                plugins: ['@babel/transform-react-jsx', '@babel/plugin-proposal-class-properties']
            }
        }]
        // 不检查node_modules下的js文件
		// exclude: "/node_modules/"
    },
    {
        test:/\.(png|jpe?g|gif|svg)$/i,
        use:[{
            loader: "url-loader",
            options: {
                limit: 5 * 1024, //小于这个时将会已base64位图片打包处理
                outputPath: "static/img" // 图片文件输出的文件夹
            }
        }]
    },
    {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use:[{
            loader: "url-loader",
            options: {
                limit: 10000
            }
        }]
    },
    {
        test: /\.html$/,
        use: ["html-withimg-loader"] // html中的img标签
    },
    {
        test: /\.less$/,
        use: lessUsed
    },
    {
        test: require.resolve('zepto'),
        use: ['exports-loader?window.Zepto','script-loader']
    }
]

module.exports = rules