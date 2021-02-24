require('dotenv').config();
const {TronBlockLog,GetLog,Coin,RequestLog} = require('../../db/models');
const BlockServer = require('../../db/server/BlockServer');
const Decimal = require('decimal.js');

let blockServer = new BlockServer();

start()

//异常处理
async function start(){
	try {
		let dbblock = await TronBlockLog.max('blockNumber');
		// let blockServer = new BlockServer();
		let blockInfo = await blockServer.getBlock(dbblock);
		if('transactions' in blockInfo && blockInfo.transactions.length >0 ){	
			await transaction(blockInfo);
		}
		await blockStart();
	} catch (error) {
		console.log(error);
		await sellp(1000*15);
		await start();
	}
}
//累加区块高度
async function blockStart() {
	// let blockServer = new BlockServer();
	let nextBlock = await TronBlockLog.max('blockNumber') + 1;
	let blockInfo = await blockServer.getBlock(nextBlock);
	if('transactions' in blockInfo && blockInfo.transactions.length >0 ){
		await TronBlockLog.create({ blockNumber: nextBlock });
		await transaction(blockInfo);
	}else{
		await TronBlockLog.create({ blockNumber: nextBlock });
	}
	await blockStart();
}

// 获取到区块交易
async function transaction(blockInfo){
	console.log( Date.now()	+ ' 处理区块 ：' + blockInfo.block_header.raw_data.number);
	let coin = Array.from(await Coin.findAll({ where: {type: 1 }, attributes: [ 'address' ] ,raw: true}),v=>v.address );
	// let blockServer = new BlockServer();
	await blockServer.init();
	//let feeList = Array.from(await CoinConfig.findAll({ attributes: [ 'fee_address' ] ,raw: true}),v=>v.fee_address );
	for (const value of blockInfo.transactions) {
		if( !await GetLog.findOne({ where:{ hash: value.txID} })){//value.ret[0].contractRet == 'SUCCESS' &&
			//代笔交易
			if(value.raw_data.contract[0].type == 'TriggerSmartContract'){
				if( coin.includes(blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address)) ){
					if( value.raw_data.contract[0].parameter.value.data.substring(0,8 ) == 'a9059cbb'){
						try {
							result = await blockServer.decodeParams(['address', 'uint256'],'0x'+value.raw_data.contract[0].parameter.value.data , true);
							if( await blockServer.isSystemAddress(blockServer.toChecksumAddress( result[0])) 
								|| await blockServer.isSystemAddress(blockServer.toChecksumAddress( value.raw_data.contract[0].parameter.value.owner_address )) ){
								let info = {
									type: 1,
									status: value.ret[0].contractRet,
									contract: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address),
									blockNumber: blockInfo.block_header.raw_data.number,
									hash: value.txID,
									from: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.owner_address),
									to: blockServer.toChecksumAddress(result[0]),
									value: Decimal(result[1].toString()).div(10 ** blockServer.coinList.get(blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address)).decimal ).toFixed()
								};
								await GetLog.create({ 
									type: 1,
									contract: info.contract,
									blockNumber: info.blockNumber,
									hash: info.hash,
									from: info.from,
									to: info.to,
									value: info.value,
									expands:  JSON.stringify(info) 
								});
								await RequestLog.create({ scene:0, url: process.env.CALL_BACK_GET,request: JSON.stringify(info)});
								console.log('代笔交易hash:' ,value.txID);
							}
						} catch (error) {
							console.log(value.txID);
							console.log(value.raw_data.contract[0].parameter.value.data);
						}
						
					}
				}
			}else if(value.raw_data.contract[0].type == 'TransferContract'){
				try {
					if( await blockServer.isSystemAddress(blockServer.toChecksumAddress( value.raw_data.contract[0].parameter.value.to_address  )) 
						|| await blockServer.isSystemAddress(blockServer.toChecksumAddress( value.raw_data.contract[0].parameter.value.owner_address  ))){
						let info = {
							type: 1,
							status: value.ret[0].contractRet,
							contract: 'Trx',
							blockNumber: blockInfo.block_header.raw_data.number,
							hash: value.txID,
							from: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.owner_address),
							to: blockServer.toChecksumAddress( value.raw_data.contract[0].parameter.value.to_address ),
							value: Decimal(value.raw_data.contract[0].parameter.value.amount.toString()).div(10 ** 6 ).toFixed()
						};
						await GetLog.create({ 
							type: 1,
							contract: info.contract,
							blockNumber: info.blockNumber,
							hash: info.hash,
							from: info.from,
							to: info.to,
							value: info.value,
							expands:  JSON.stringify(info) 
						});
						await RequestLog.create({ scene:0, url: process.env.CALL_BACK_GET,request: JSON.stringify(info)});
						console.log('Trx交易hash:' ,value.txID);
					}
				} catch (error) {
					console.log(value.txID);
					console.log(value.raw_data.contract[0].parameter.value.data);
				}
			}
		}
	}
}

function sellp(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    })
  }
