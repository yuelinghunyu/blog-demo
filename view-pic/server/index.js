const Koa = require("koa")
const app = new Koa()

app.listen(4000, () => { console.log("服务正常启动") })