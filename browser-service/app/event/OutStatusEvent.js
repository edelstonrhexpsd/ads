require('dotenv').config();
const Sequelize = require('sequelize');
const {OutLog,RequestLog} = require('../../db/models');
const BlockServer = require('../../db/server/BlockServer');

const Op = Sequelize.Op;

start()
async function start(){
	try {
		await putRequest();
	} catch (error) {
		console.log(error);
		console.log('提笔通知，等待15秒重新启动');
		await sellp(1000*15);
		await putRequest();
	}
	
}

async function putRequest(){
    let blockServer = new BlockServer();
    let list = await OutLog.findAll({ 
        where: {
             status: 0,
             updatedAt: { 
                [Op.lte]: new Date(new Date() - 3 * 60 * 1000)             // <= 10
                },
            }, 
        order: [['id', 'ASC']], 
        limit: 50 
    });
    for (const iterator of list) {
        if(iterator.hash){
            
            let info = await blockServer.getTransactionAll(iterator.hash);
            if('receipt' in info){
                if(info.receipt.result === 'SUCCESS'){
                    iterator.hash = info.id;
                    iterator.blockNumber = info.blockNumber;
                    iterator.status = 1;
                    iterator.expands = JSON.stringify({order_id:iterator.order_id,hash:info.id,blockNumber:info.blockNumber,status:true });
                    iterator.save();
                    RequestLog.create({ scene:2 , url: process.env.CALL_BACK_OUT,request:JSON.stringify({order_id:iterator.order_id,hash:info.id,blockNumber:info.blockNumber,status:true }) });
                }else{
                    iterator.hash = info.id;
                    iterator.blockNumber = info.blockNumber;
                    iterator.status = 2;
                    iterator.expands = JSON.stringify({order_id:iterator.order_id,hash:info.id,blockNumber:info.blockNumber,status:false });
                    iterator.save();
                    RequestLog.create({ scene:2 , url: process.env.CALL_BACK_OUT,request:JSON.stringify({order_id:iterator.order_id,hash:info.id,blockNumber:info.blockNumber,status:false }) });
                }
            }
        }else{
            iterator.status = 2;
            iterator.expands = JSON.stringify({order_id:iterator.order_id,hash:iterator.hash,blockNumber:iterator.blockNumber,status:false,error:'hash获取失败' });
            iterator.save();
            RequestLog.create({ scene:2 , url: process.env.CALL_BACK_OUT,request:JSON.stringify({order_id:iterator.order_id,hash:iterator.hash,blockNumber:iterator.blockNumber,status:false,error:'hash获取失败' }) });
        }
    }
    await sellp(1000*30);
    await putRequest();
}
function sellp(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    })
  }
