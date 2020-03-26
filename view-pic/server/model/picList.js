const Sequelize = require("sequelize")
const connection = require("../config/connect")

const Model = Sequelize.Model
class PicList extends Model { }

PicList.init({
  id: {
    type: Sequelize.STRING(40), // varchar(32)
    primaryKey: true,
    allowNull: false, // 不允许为null
    comment: "图片id"
  },
  file_path: {
    type: Sequelize.STRING(255),
    allowNull: false, // 不允许为null
    comment: "图片访问路径"
  }
}, {
  connection,
  freezeTableName: true,
  modelName: 'pic_list', // 数据库表名
  timestamps: false
})
PicList.sync()
module.exports = PicList