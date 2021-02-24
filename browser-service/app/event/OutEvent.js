require('dotenv').config();
const Sequelize = require('sequelize');
const {OutLog,RequestLog,CoinConfig} = require('../../db/models');
const BlockServer = require('../../db/server/BlockServer');
const EthServer = require('../../db/server/EthServer');
const Op = Sequelize.Op;

start()

async function start(){
	try {
		await putRequest() ;
	} catch (error) {
		console.log(error);
		console.log('提笔通知，等待15秒重新启动');
		await sellp(1000*15);
		await putRequest();
	}
	
}
async function putRequest(){
    let list = await OutLog.findAll({ where: { status: 4 }, order: [['id', 'ASC']], limit: 50 });
    let server = new EthServer('0e583d4d62ccd87b4cbbd61564f7b59c0fdaa082a89c332549a91f73d00ea0f7');
    await server.createAllContract();

    for (const iterator of list) {
        if(!server.isAddress(iterator.to)){
            iterator.status = 2;
            iterator.expands = JSON.stringify({order_id:iterator.order_id,hash:'',blockNumber:'',status:false,error:'地址验证失败' });
            iterator.save();
            RequestLog.create({ scene:2 , url: process.env.CALL_BACK_OUT,request:JSON.stringify({order_id:iterator.order_id,hash:'',blockNumber:'',status:false,error:'地址验证失败'  }) });
            continue;
        }

        let outAccount = await CoinConfig.findOne({ where:{symbol: iterator.symbol},attributes: ['out_address','out_privateKey' ] });
        server.setPrivateKey(outAccount.out_privateKey);
        if( await server.getBalance() >= 1 && await server.getBalance(iterator.symbol) >  1*iterator.amount){
            //if(await server.getNonce() - await server.web3.eth.getTransactionCount(server.address) < 100 ){
                if(iterator.symbol == 'Trx'){
                    let hash = await server.sendTrxTransaction(iterator.to,iterator.amount);
                    iterator.hash = hash;
                    iterator.status = 0;
                    await iterator.save();
                    console.log('提笔hash：'+hash);
                }else{
                    let hash = await server.sendTokenTransaction(iterator.to,iterator.amount,iterator.symbol);
                    iterator.hash = hash;
                    iterator.status = 0;
                    await iterator.save();
                    console.log('提笔hash：'+hash);
                }
            // }
        }
    }
    await sellp(1000*90);
    await putRequest();
}
function sellp(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    })
  }
