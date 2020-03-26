const PicList = require("../model/picList")

class PicListCtl {
  async getAllPicList (ctx) {
    const { page, limit } = ctx.params
    const data = await PicList.findAll({
      limit: limit,
      offset: Number((page - 1) * limit),
      attributes: ['id', 'file_path']
    })
    const list = data.rows
    const total = data.count
    ctx.body = {
      code: 200,
      msg: "success",
      content: {
        list: list,
        total: total
      }
    }
  }
}

module.exports = new PicListCtl()