const hprose = require("hprose");
const EthServer = require('./db/server/EthServer');
const CoinServer = require('./db/server/Coin');
const Crypto = require('./db/server/Crypto');
const {Coin,User,OutLog,CoinConfig} = require('./db/models');
// const Decimal = require('decimal.js');
const ethServer = new EthServer('',1);
const privateServer = new EthServer('',2);
const coinServer = new CoinServer('',1);
const privateCoinServer = new CoinServer('',2);

/**
 * 获取地址
 * @param {*} uid 用户id
 * @param {*} address 公链地址
 */
async function getAddress(uid,address){
    let user = await User.findOne({where:{uid:uid}});
    if( !user ){
        let server = privateServer;
        let object = await server.creatAddress();
        await User.create({address:address,privateAddress: object.address.base58,uid:uid,privateKey: Crypto.encrypt(object.privateKey)});
        return {address:address,privateAddress:object.address.base58, privateKey:object.privateKey };
    }else{
        return {address:user.address,privateAddress:user.privateAddress, privateKey:Crypto.decrypt(user.privateKey) };
    }
}


/**
 * 交易所币种配置
 * @param {*} type 类型1公链2私链
 * @param {*} address 合约地址Trx或者真实的合约地址
 * @param {*} exchange_address 交易所提笔地址
 * @param {*} exchange_privateKey 交易所提笔私钥
 */
async function setExchangeCoin(type, address,exchange_address,exchange_privateKey){
    let server;
    if(type == 1){
        server = coinServer;
    }else if(type == 2){
        server = privateCoinServer;
    }else{
        return {status:false,msg:'不支持的底链'};
    }
    if( (server.isAddress(address) || address=='Trx') && server.isAddress(exchange_address) ){
        let coinObj = await Coin.findOne({ where:{ address:address,type:type } })
        if( !coinObj && address !='Trx'){
            let contract = await server.getContract(address);
            if(contract){
                let abi = contract.abi.entrys;
                await server.createContract(abi,address);
                let name = await server.getName(),
                    symbol =  await server.getSymbol(),
                    amount = await server.getTotalSupply(),
                    decimal = await server.getDecimals();
                coinObj = await Coin.create({type, name: name, symbol: symbol,address: address,amount: amount,decimal: decimal,abi:JSON.stringify(abi) });
            }else{
                return {status:false,msg:'配置失败,获取合约失败'};
            }
        }
        let obg = await CoinConfig.findOne({ where:{ address:address,type:type } });
        if(obg){
            await obg.update({ exchange_address: exchange_address ,exchange_privateKey: Crypto.encrypt(exchange_privateKey) });
        }else{
            await CoinConfig.create({ type,
                name:  "Trx" == address?'Trx':coinObj.name,
                symbol:"Trx" == address?'Trx':coinObj.symbol,
                address:"Trx" == address?'Trx': coinObj.address,
                exchange_address,exchange_privateKey: Crypto.encrypt(exchange_privateKey),
                wallet_address: '暂未设置' ,wallet_privateKey: '暂未设置' });
        }
        return {status:true,msg:'配置成功'};
    }
    return {status:false,msg:'配置失败,合约地址或提币地址验证失败'};
}

/**
 * 钱包币种配置
 * @param {*} type 类型1公链2私链
 * @param {*} address 合约地址Trx或者真实的合约地址
 * @param {*} wallet_address 钱包提笔地址
 * @param {*} wallet_privateKey 钱包提笔私钥
 */
async function setWalletCoin(type, address,wallet_address,wallet_privateKey){
    let server;
    if(type == 1){
        server = coinServer;
    }else if(type == 2){
        server = privateCoinServer;
    }else{
        return {status:false,msg:'不支持的底链'};
    }
    if( (server.isAddress(address) || address=='Trx') && server.isAddress(wallet_address) ){
        let coinObj = await Coin.findOne({ where:{ address:address,type:type } })
        if( !coinObj && address !='Trx'){
            let contract = await server.getContract(address);
            if(contract){
                let abi = contract.abi.entrys;
                await server.createContract(abi,address);
                
                let name = await server.getName(),
                    symbol =  await server.getSymbol(),
                    amount = await server.getTotalSupply(),
                    decimal = await server.getDecimals();
                coinObj = await Coin.create({type, name: name, symbol: symbol,address: address,amount: amount,decimal: decimal,abi:JSON.stringify(abi) });
            }else{
                return {status:false,msg:'配置失败,获取合约失败'};
            }
        }
        let obg = await CoinConfig.findOne({ where:{ address:address,type:type } });
        if(obg){
            await obg.update({ wallet_address: wallet_address ,wallet_privateKey: Crypto.encrypt(wallet_privateKey) });
        }else{
            await CoinConfig.create({ type,
                name:"Trx" == address?'Trx':coinObj.name,
                symbol:"Trx" == address?'Trx':coinObj.symbol,
                address:"Trx" == address?'Trx':coinObj.address,
                exchange_address: '暂未设置',exchange_privateKey:'暂未设置',
                wallet_address: wallet_address ,wallet_privateKey:  Crypto.encrypt(wallet_privateKey) });
        }
        return {status:true,msg:'配置成功'};
    }
    return {status:false,msg:'配置失败,合约地址或提币地址验证失败'};
}

/**
 * 交易
 * @param {*} order_id 订单号唯一 （推荐交易所和钱包使用不同的前缀以区分）
 * @param {*} type 类型1公链2私链
 * @param {*} contractAddress 合约地址Trx或者真实的合约地址
 * @param {*} to 接收的地址
 * @param {*} amount 接收的数量
 * @param {*} scene 使用的钱包固定值 交易所exchange 钱包wallet
 */
async function transaction(order_id,type,contractAddress,to,amount,scene){
    let server;
    if(type == 1){
        server = ethServer;
    }else if(type == 2){
        server = privateServer;
    }else{
        return {status:false,msg:'不支持的底链'};
    }
    let info = await OutLog.findOne({where: {order_id: order_id}  });
    if( !info ){
        let outAccount = await CoinConfig.findOne({ where:{address:contractAddress,type:type  },attributes: [ [scene+'_address','out_address'],[scene+'_privateKey','out_privateKey'] ] }) ;
        if(!outAccount){
            return {status:false,msg:'币种未配置'};
        }
        outAccount = outAccount.toJSON();console.log(outAccount);
        let iterator = await Coin.findOne({ where: {type: type,address:contractAddress  }});
        contractAddress == 'Trx' || await server.createContract(iterator);
        await server.setPrivateKey(outAccount.out_privateKey);
        if( await server.getBalance() >= 1 && await server.getBalance( iterator?iterator.symbol:'Trx') >  1*amount){
            if(contractAddress == 'Trx'){
                var hash = await server.sendTrxTransaction(to,amount);
            }else{
                var hash = await server.sendTokenTransaction(to,amount,iterator.symbol);
            }
            await OutLog.create({hash:hash,type:type, order_id: order_id,symbol: contractAddress,amount: amount,from: outAccount.out_address,to:to,status:0 });
            return {status:true,hash:hash};
        }else{
            return {status:false,msg:'余额不足'};
        }
    }
    return {status:true,msg:'订单号已存在'};
}

/**
 * 查询余额
 * @param {*} type 类型1公链2私链
 * @param {*} contractAddress 合约地址Trx或者真实的合约地址
 * @param {*} address 查询的地址
 */
async function balance(type,contractAddress,address) {
    let server = type == 1 ? ethServer : (type == 2 ? privateServer : false );
    if( !server ){
        return {status:false,msg:'不支持的底链'};
    }
    if(contractAddress === 'Trx'){
        return await server.getBalance('Trx',address);
    }else{
        let emit = await Coin.findOne({ where: {type: type,address:contractAddress  }});
        if(emit){
            await server.createContract(emit);
            return await server.getBalance(emit.symbol,address);
        }
    }
    return false;
}

let server = hprose.Server.create("tcp://0.0.0.0:3000");
server.add(getAddress);
server.add(setExchangeCoin);
server.add(setWalletCoin);
server.add(transaction);
server.add(balance);
// server.add(orderStates);
server.start();