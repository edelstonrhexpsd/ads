const Koa = require('koa');// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示
const bodyParser = require('koa-bodyparser');//引入一个middleware来解析原始request请求，把解析后的参数，绑定到ctx.request.body中
const log4js = require('koa-log4');//引入koa-log4
const controller = require('./app/middleware/controller');// 导入controller middleware
const templating = require('./app/middleware/templating');// 导入templating middleware
const { logger, accessLogger } = require('./app/middleware/logger');//logger middleware

require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// 解析静态资源
if (! isProduction) {
    let staticFiles = require('./app/middleware/static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// 解析body中间件
app.use(bodyParser());

// log request URL:
app.use(accessLogger);

// 缓存视图
app.use(templating('app/views', {
    noCache: !isProduction,
    watch: !isProduction
}));

// 加载控制器
app.use(controller('controllers'));

app.on('error', err => {
    logger.error(err);
});
// 在端口3000监听:
app.listen(3001);
console.log('app started at port 3001...');
