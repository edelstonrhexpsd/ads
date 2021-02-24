const {Coin,CoinConfig} = require('../../db/models');
const CoinServer = require('../../db/server/Coin');
const Crypto = require('../../db/server/Crypto');
const EthServer = require('../../db/server/EthServer');

let index = async (ctx,next)=>{
    let coin = await Coin.findAll();
    let coinConfig = await CoinConfig.findAll({ attributes:['id','name','symbol','address','pool_address','fee_address','out_address','createdAt','updatedAt'  ] });
    return ctx.response.body = {status:200,coin,coinConfig};

}

let setCoin = async (ctx,next)=>{
    let {address,pool_address,fee_address,fee_privateKey,out_address,out_privateKey} = ctx.request.body;
    let server = new CoinServer(out_privateKey);
    if( ! server.isAddress(address)){
        return ctx.response.body = {status:200,msg:'配置失败,合约地址或配置地址验证失败'};
    }
    let contract = await server.getContract(address);
    if(contract && !await Coin.findOne({ where:{ address:address } }) &&  server.isAddress(pool_address) && server.isAddress(fee_address) && server.isAddress(out_address)){
        let abi = contract.abi.entrys;
        await server.createContract(abi,address);
        let name = await server.getName(),
            symbol =  await server.getSymbol(),
            amount = await server.getTotalSupply(),
            decimal = await server.getDecimals();
        await Coin.create({ name: name, symbol: symbol,address: address,amount: amount,decimal: decimal,abi:JSON.stringify(abi) });
        await CoinConfig.create({ name,symbol,address,is_pool:1, 
            pool_address: pool_address,
            fee_address: fee_address ,fee_privateKey: Crypto.encrypt(fee_privateKey) ,
            out_address: out_address ,out_privateKey: Crypto.encrypt(out_privateKey) });
        return ctx.response.body = {status:200,msg:'配置成功'};
    }else{
        return ctx.response.body = {status:200,msg:'配置失败,合约地址或配置地址验证失败'};
    }

}

let upCoin = async (ctx,next)=>{
    let {address,pool_address,fee_address,fee_privateKey,out_address,out_privateKey} = ctx.request.body;
    let server = new CoinServer(out_privateKey);
    if( !server.isAddress(address) && address !== 'Trx'  ){
        return ctx.response.body = {status:200,msg:'配置失败,合约地址或配置地址验证失败'};
    }
    let obg = await CoinConfig.findOne({ where:{ address:address } });
    if( obg && server.isAddress(pool_address) && server.isAddress(fee_address) && server.isAddress(out_address)){
        await obg.update({ 
            pool_address: pool_address,
            fee_address: fee_address ,fee_privateKey: Crypto.encrypt(fee_privateKey) ,
            out_address: out_address ,out_privateKey: Crypto.encrypt(out_privateKey) 
         });
        return ctx.response.body = {status:200,msg:'配置成功'};
    }else{
        return ctx.response.body = {status:200,msg:'配置失败,合约不存在或配置地址验证失败'};
    }

}

let setCoinCreate = async (ctx,next)=>{
    let {address,pool_address} = ctx.request.body;//,fee_address,fee_privateKey,out_address,out_privateKey
    let server = new CoinServer('0e583d4d62ccd87b4cbbd61564f7b59c0fdaa082a89c332549a91f73d00ea0f7');
    if( ! server.isAddress(address)){
        return ctx.response.body = {status:200,msg:'配置失败,合约地址或配置地址验证失败'};
    }
    let contract = await server.getContract(address);
    if(contract && !await Coin.findOne({ where:{ address:address } }) &&  server.isAddress(pool_address) ){
        //
        let abi = contract.abi.entrys;
        await server.createContract(abi,address);
        let name = await server.getName(),
            symbol =  await server.getSymbol(),
            amount = await server.getTotalSupply(),
            decimal = await server.getDecimals();
        await Coin.create({ name: name, symbol: symbol,address: address,amount: amount,decimal: decimal,abi:JSON.stringify(abi) });
        //
        let eServer = new EthServer( );
        let fee = await eServer.creatAddress();
        let {fee_address,fee_privateKey} = {fee_address:fee.address.base58 ,fee_privateKey:fee.privateKey};
        let out = await eServer.creatAddress();
        let {out_address,out_privateKey} = {out_address:out.address.base58 ,out_privateKey:out.privateKey};
        await CoinConfig.create({ name,symbol,address,is_pool:1, 
            pool_address: pool_address,
            fee_address: fee_address ,fee_privateKey: Crypto.encrypt(fee_privateKey) ,
            out_address: out_address ,out_privateKey: Crypto.encrypt(out_privateKey) });
        return ctx.response.body = {status:200,msg:'配置成功'};
    }else{
        return ctx.response.body = {status:200,msg:'配置失败,合约地址或配置地址验证失败'};
    }
}

let upCoinCreate = async (ctx,next)=>{
    let {address,pool_address} = ctx.request.body;//,fee_address,fee_privateKey,out_address,out_privateKey
    let server = new CoinServer('0e583d4d62ccd87b4cbbd61564f7b59c0fdaa082a89c332549a91f73d00ea0f7');
    if( !server.isAddress(address) && address !== 'Trx'  ){
        return ctx.response.body = {status:200,msg:'配置失败,合约地址或配置地址验证失败'};
    }
    let obg = await CoinConfig.findOne({ where:{ address:address } });
    if( obg && server.isAddress(pool_address) ){
        let eServer = new EthServer( );
        let fee = await eServer.creatAddress();
        let {fee_address,fee_privateKey} = {fee_address:fee.address.base58 ,fee_privateKey:fee.privateKey};
        let out = await eServer.creatAddress();
        let {out_address,out_privateKey} = {out_address:out.address.base58 ,out_privateKey:out.privateKey};
        await obg.update({ 
            pool_address: pool_address,
            fee_address: fee_address ,fee_privateKey: Crypto.encrypt(fee_privateKey) ,
            out_address: out_address ,out_privateKey: Crypto.encrypt(out_privateKey) 
         });
        return ctx.response.body = {status:200,msg:'配置成功'};
    }else{
        return ctx.response.body = {status:200,msg:'配置失败,合约不存在或配置地址验证失败'};
    }
}

let balance = async (ctx, next) => {
    // let symbol = ctx.params.symbol;

    // let server = new EthServer( await EthServer.getNode() );
    // await server.createAllContract();
    // let coinAll = await CoinConfig.findAll();
    // let coin = await CoinConfig.findOne({ where:{ symbol:symbol } });
    // let ret = {pool_address:{},fee_address:{},out_address:{}};
    // for (const iterator of coinAll) {
    //     ret.pool_address[iterator.symbol] = await server.getBalance(iterator.symbol ,coin.pool_address);
    //     ret.fee_address[iterator.symbol] = await server.getBalance(iterator.symbol ,coin.fee_address);
    //     ret.out_address[iterator.symbol] = await server.getBalance(iterator.symbol ,coin.out_address);
    // }
    // return ctx.response.body = {status:200, list:ret};
    return ctx.response.body = {status:200, msg:'接口已关闭'};
};

module.exports = {
    'GET /coin/index': index,
    'POST /coin/setCoin': setCoin,
    'POST /coin/upCoin': upCoin,
    'POST /coin/setCoinCreate': setCoinCreate,
    'POST /coin/upCoinCreate': upCoinCreate,
    'GET /coin/balance/:symbol':  balance
};