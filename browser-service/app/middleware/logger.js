const path = require('path');//引入原生path模块
const log4js = require('koa-log4');//引入koa-log4

log4js.configure({
  appenders: {
    //访问日志
    access: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //通过日期来生成文件
      alwaysIncludePattern: true, //文件名始终以日期区分
      encoding:"utf-8",
      filename: path.join('logs/access/', 'access') //生成文件路径和文件名
    },
    //系统日志
    application: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //通过日期来生成文件
      alwaysIncludePattern: true, //文件名始终以日期区分
      encoding:"utf-8",
      filename: path.join('logs/application/', 'application') //生成文件路径和文件名
    },
    //sql日志
    sql: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //通过日期来生成文件
      alwaysIncludePattern: true, //文件名始终以日期区分
      encoding:"utf-8",
      filename: path.join('logs/sql/', 'sql') //生成文件路径和文件名
    },
    out: {
      type: 'console'
    }
  },
  categories: {
    default: { appenders: [ 'out' ], level: 'info' },
    access: { appenders: [ 'access' ], level: 'info' },
    application: { appenders: [ 'application' ], level: 'WARN'},
    sql:{appenders: [ 'sql' ], level: 'info'}
  }
});

// exports.accessLogger = () => log4js.koaLogger(log4js.getLogger('access')); //记录所有访问级别的日志
exports.accessLogger =  async (ctx, next) => {
  async function log(ctx){log4js.getLogger('access').info(JSON.stringify(ctx.request) +' '+ JSON.stringify(ctx.request.body));}
  log(ctx);
  return await next();
}
exports.logger = log4js.getLogger('application');  //记录所有应用级别的日志
exports.sqlLog = log4js.getLogger('sql');  //记录所有应用级别的日志
