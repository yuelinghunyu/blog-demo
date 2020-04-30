
const path = require("path")
const config = {
  publicPath: process.env.NODE_ENV === 'production' ? "/cache/" : "",
  outputDir: path.resolve(__dirname, "../cache-node/app/public/cache"),
  assetsDir: "static",
  devServer: {
    proxy: {
      "/cache": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
}

module.exports = config