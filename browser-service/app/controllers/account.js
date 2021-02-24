const EthServer = require('../../db/server/EthServer');
const Crypto = require('../../db/server/Crypto');
const {Coin,User,OutLog,CoinConfig} = require('../../db/models');
const Decimal = require('decimal.js');

let balance = async (ctx, next) => {
    let address = ctx.params.address;
    let symbol = ctx.params.symbol;
    if(symbol === 'Trx'){
        let server = new EthServer();
        return ctx.response.body =  {status:200, symbol:symbol, amount:await server.getBalance('Trx',address) };
    }else{
        let server = new EthServer('0e583d4d62ccd87b4cbbd61564f7b59c0fdaa082a89c332549a91f73d00ea0f7');
        let emit = await Coin.findOne({ where: {symbol: symbol}, attributes: ['symbol','address','decimal','abi'] });
        if(emit){
            await server.createContract({symbol:emit.symbol, address:emit.address, decimal:emit.decimal, abi:emit.abi });
            return ctx.response.body = {status:200, symbol:symbol, amount:await server.getBalance(emit.symbol,address)};
        }else{
            return ctx.response.body = {status:200, symbol:symbol, msg:'不支持的代币'};
        }
    }
};

let createAddress = async (ctx,next) => {
    let uid = ctx.params.uid;
    let user = await User.findOne({where:{uid:uid}});
    if( !user ){
        let server = new EthServer( );
        let object = await server.creatAddress();
        await User.create({address:object.address.base58,uid:uid,privateKey: Crypto.encrypt(object.privateKey)});
        return ctx.response.body = {status:200,address:object.address.base58};
    }else{
        return ctx.response.body = {status:200,address:user.address};
    }
};

let transaction = async (ctx, next) => {
    
    let {order_id,address,amount,uid,symbol} = ctx.request.body;
    //symbol = symbol.toUpperCase();
    if( !await OutLog.findOne({where: {order_id: order_id},attributes: ['id'] }) ){
        let outAccount = await CoinConfig.findOne({ where:{symbol: symbol},attributes: ['out_address','out_privateKey' ] });
        let server = new EthServer(outAccount.out_privateKey);
        if(!server.isAddress(address)){
            return ctx.response.body = {status:400,msg:'地址错误，请驳回申请'};
        }
        await server.createAllContract();
        if( await server.getBalance() >= 0.1 && await server.getBalance(symbol) >  1*amount){
            // if(await server.getNonce() - await server.web3.eth.getTransactionCount(server.address) < 100 ){
                await OutLog.create({ uid: uid, order_id: order_id,symbol: symbol,amount: amount,from: outAccount.out_address,to:address,status:4 });
                //await server.sendTransaction(obj.order_id,server.toChecksumAddress(address),amount,symbol);
                return ctx.response.body = {status:200,msg:'提交成功！'};
            // }else{
            //     return ctx.response.body = {status:400,msg:'等待打包的交易过多请稍等在提交'};
            // }
        }else{
            return ctx.response.body = {status:400,msg:'请检查地址余额'};
        }
    }else{
        return ctx.response.body = {status:400,msg:'订单号重复！'};

    }
    
}
let seePass = async (ctx,next) => {
    let pass = ctx.params.pass;
    
    return ctx.response.body = {status:200,privateKey:Crypto.decrypt(pass)};
    
};

module.exports = {
    'GET /account/balance/:symbol/:address': balance,
    'GET /account/createAddress/:uid': createAddress,
    'POST /account/transaction': transaction,
    'GET /account/seePass/:pass': seePass,
}
