const Sequelize = require("sequelize")
const env = process.env.NODE_ENV  // 'production'

const common_config = {
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
}
const dev_config = {
  database: "mso_db",
  username: "root",
  password: "root",
  host: "localhost",
  port: 3306,
}
const pro_config = {}

let config = env === 'production' ? Object.assign({}, common_config, pro_config) : Object.assign({}, common_config, dev_config)


const sequelize = new Sequelize(
  config.database, // database
  config.username, // username
  config.password, // password
  {
    host: config.host,
    dialect: config.dialect,
    pool: config.pool
  }
)

module.exports = sequelize