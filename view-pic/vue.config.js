const config = {
  devServer: {
    proxy: {
      '/view': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      },
    }
  }
}

module.exports = config