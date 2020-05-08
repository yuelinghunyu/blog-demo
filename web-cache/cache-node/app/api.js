
const Router = require("koa-router")
const router = new Router({ prefix: "/cache" })
let etag = 1
let day = "2020-05-08 00:00:00:000"
const returnResult = () => {
  return new Promise((resolve, reject) => {
    const body = {
      code: 200,
      msg: "success",
      content: "我是服务端数据sss"
    }
    return resolve(body)
  }).catch(error => {
    console.log(error)
  })
}

const setCache = (ctx) => {
  // 强制缓存
  // Cache-Control
  // ctx.response.set("Cache-Control", "max-age=100;public")
  // expires
  // let now = new Date().getTime()
  // now += 3600 * 1000
  // ctx.response.set("Expires", new Date(now).toGMTString())
  // 协商缓存
  // etag / if-none-match
  // ctx.response.set("Etag", etag)
  // last-modified / if-modified-since

  ctx.response.set('Last-Modified', new Date(day).toGMTString())
}

const results = async (ctx) => {
  const result = await returnResult()
  console.log("我是服务请求")
  ctx.body = result
}

const resultc = (ctx) => {
  ctx.status = 304
  console.log("我是协商缓存")
  return
}
class CacheCtl {
  async getCacheData (ctx) {
    // const match = ctx.request.get("If-None-Match")
    setCache(ctx)
    results(ctx)
    // const since = ctx.request.get('If-Modify-Since')
    // if (match == etag) {
    //   ctx.status = 304
    //   console.log("我是协商缓存")
    //   return
    // } else {
    //   const result = await returnResult()
    //   console.log("我是服务请求")
    //   ctx.body = result
    // }
    // console.log(since)
    // if (since) {
    //   let sincetime = new Date(since).getTime()
    //   if (sincetime < day) {
    //     // 设置缓存方法
    //     results(ctx)
    //   } else {
    //     resultc(ctx)
    //   }
    // } else {
    //   results(ctx)
    // }
  }
}
const cacheInstance = new CacheCtl()

router.get("/cache", cacheInstance.getCacheData)

module.exports = router
