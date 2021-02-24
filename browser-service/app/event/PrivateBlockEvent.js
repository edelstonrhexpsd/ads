require('dotenv').config();
const {PrivateBlockLog,GetLog,Coin} = require('../../db/models');
const BlockServer = require('../../db/server/BlockServer');
const CoinServer = require('../../db/server/Coin');
const Decimal = require('decimal.js');

let blockServer = new BlockServer('',2);

start()

//异常处理
async function start(){
	try {
		let dbblock = await PrivateBlockLog.max('blockNumber')  || 1;
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
	let nextBlock = (await PrivateBlockLog.max('blockNumber') || 0 )+ 1;
	let blockInfo = await blockServer.getBlock(nextBlock);
	await PrivateBlockLog.create({ 
		blockNumber: blockInfo.block_header.raw_data.number ,
		blockHash: blockInfo.blockID,
		txTrieRoot: blockInfo.block_header.raw_data.txTrieRoot,
		witnessAddress: blockServer.toChecksumAddress( blockInfo.block_header.raw_data.witness_address ),
		parentHash: blockInfo.block_header.raw_data.parentHash,
		blockTimestamp: blockInfo.block_header.raw_data.timestamp,
		transactionsNum:'transactions' in blockInfo ? blockInfo.transactions.length : 0
	});
	if('transactions' in blockInfo && blockInfo.transactions.length >0 ){
		await transaction(blockInfo);
	}
	await blockStart();
}

// 获取到区块交易
async function transaction(blockInfo){
	console.log( Date.now()	+ ' 处理区块 ：' + blockInfo.block_header.raw_data.number);
	// let blockServer = new BlockServer();
	for (const value of blockInfo.transactions) {
		if( !await GetLog.findOne({ where:{ hash: value.txID} })){//value.ret[0].contractRet == 'SUCCESS' &&
			//代笔交易
			if(value.raw_data.contract[0].type == 'TriggerSmartContract'){
				if( value.raw_data.contract[0].parameter.value.data.substring(0,8 ) == 'a9059cbb'){
					try {
						let coinObj = await Coin.findOne({ where:{ address:blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address) } })
						if( !coinObj ){
							let privateCoinServer = new CoinServer('',2);
							let contract = await privateCoinServer.getContract(blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address) );
							if(contract){
								let abi = contract.abi.entrys;
								await privateCoinServer.createContract(abi,blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address));
								let name = await privateCoinServer.getName(),
									symbol =  await privateCoinServer.getSymbol(),
									amount = await privateCoinServer.getTotalSupply(),
									decimal = await privateCoinServer.getDecimals();
								coinObj = await Coin.create({ 
									name: name, symbol: symbol,
									address: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address),
									amount: amount,decimal: decimal,abi:JSON.stringify(abi) });
							}else{
								continue;
							}
						}
						let result = await blockServer.decodeParams(['address', 'uint256'],'0x'+value.raw_data.contract[0].parameter.value.data , true);
						let info = {
							blockNumber: blockInfo.block_header.raw_data.number,
							contractRet: value.ret[0].contractRet,
							contract: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.contract_address),
							hash: value.txID,
							from: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.owner_address),
							to: blockServer.toChecksumAddress(result[0]),
							value: Decimal(result[1].toString()).div(10 ** coinObj.decimal ).toFixed(),
							transactionsTimestamp: value.raw_data.timestamp,
							expands: JSON.stringify(value) 
						};
						await GetLog.create(info);
						console.log('代笔交易hash:' ,value.txID);
					} catch (error) {
						console.log(value.txID);
						console.log(value.raw_data.contract[0].parameter.value.data);
					}
				}
			}else if(value.raw_data.contract[0].type == 'TransferContract'){
				try {
					let info = {
							blockNumber: blockInfo.block_header.raw_data.number,
							contractRet: value.ret[0].contractRet,
							contract: 'Trx',
							hash: value.txID,
							from: blockServer.toChecksumAddress(value.raw_data.contract[0].parameter.value.owner_address),
							to: blockServer.toChecksumAddress( value.raw_data.contract[0].parameter.value.to_address ),
							value: Decimal(value.raw_data.contract[0].parameter.value.amount.toString()).div(10 ** 6 ).toFixed(),
							transactionsTimestamp: value.raw_data.timestamp,
							expands: JSON.stringify(value) 
						};
					await GetLog.create(info);
					console.log('Trx交易hash:' ,value.txID);		
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
