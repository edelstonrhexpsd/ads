const { sqlLog } = require('../app/middleware/logger');//logger middleware
module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOSTNAME,
    "dialect": process.env.DB_DIALECT,
    "timezone": "+08:00",
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOSTNAME,
    "dialect": process.env.DB_DIALECT,
    "timezone": "+08:00",
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOSTNAME,
    'timezone': "+08:00",
    "dialect": process.env.DB_DIALECT,
    "timezone": "+08:00",
    logging: function(sql) {
      // logger为log4js的Logger实例
      sqlLog.info(sql);
    },

  }
}