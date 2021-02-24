require('dotenv').config();
const retry = require('bluebird-retry');
const {RequestLog} = require('../../db/models');
const request = require('request');

requestStart();
async function requestStart() {
    console.log('开始运行请求发送');
    let list  = await RequestLog.findAll({ where: {status: 0 } });
    for (const iterator of list) {
        await iterator.update({ status: 1 });
        retry(requestPost, { max_tries: 7, interval: 2000, backoff: 5 ,args:[iterator.url, iterator.request] })
        .then(function(result) {
            iterator.update({ status: 2,response: JSON.stringify(JSON.parse(result)) });
            console.log( (new Date()).getTime()+' '+new Date()+': '+iterator.id+' 执行成功 '+iterator.response);
        });
        await sellp(500);
    }
    console.log('运行结束');
    await sellp(60000*1);
    await requestStart();
}

function sellp(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    })
  }
  
function requestPost(url,data) {
    return new Promise((resolve, reject) => {
        request({
            url: url,//请求路径
            method: "POST",//请求方式，默认为get
            headers: {//设置请求头
                "content-type": "application/json",
            },
            body: typeof data === 'string'? data : JSON.stringify(data)//post参数字符串
        }, (error, response, body)=>{
            try {
                if (!error && response.statusCode == 200 && (JSON.parse(body)).status ===200 ) {
                    return resolve(JSON.stringify(JSON.parse(body)));
                }else{
                    return reject(error);
                }
            } catch (err) {
                return reject(new Error('为返回status，无法解析内容'));
            }
            
        });   
    });
}