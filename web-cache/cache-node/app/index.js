const Koa = require("koa")
const app = new Koa()
const path = require("path")
const serve = require("koa-static")

const route = require("./api")
const public = serve(path.join(__dirname) + '/public/')

app.use(public)
app.use(route.routes())
  .use(route.allowedMethods())

app.listen(3000, () => {
  console.log("缓存服务启动成功")
})