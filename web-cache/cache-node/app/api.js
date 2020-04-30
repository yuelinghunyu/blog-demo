
const Router = require("koa-router")
const router = new Router({ prefix: "/cache" })

const returnResult = () => {
  return new Promise((resolve, reject) => {
    const body = {
      code: 200,
      msg: "success",
      content: "我是服务端数据"
    }
    return resolve(body)
  }).catch(error => {
    console.log(error)
  })
}

const setCache = (ctx) => {
  // Cache-Control
  ctx.response.set("Cache-Control", "max-age=10;private")
}
class CacheCtl {
  async getCacheData (ctx) {
    // 设置缓存方法
    setCache(ctx)
    const result = await returnResult()
    ctx.body = result
  }
}

const cacheInstance = new CacheCtl()

router.get("/debug", cacheInstance.getCacheData)

module.exports = router
