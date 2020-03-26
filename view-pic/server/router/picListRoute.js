const Router = require("koa-router")
const router = new Router({ prefix: "/view" })
const { getAllPicList } = require("../controller/picListCtl")


router.get("/:page/:limit", getAllPicList)

module.exports = router