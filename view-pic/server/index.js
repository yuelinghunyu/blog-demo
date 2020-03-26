const Koa = require("koa")
const app = new Koa()

const routing = require('./router')
routing(app)
app.listen(3000, () => { console.log("服务正常启动") })