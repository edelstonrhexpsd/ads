require('dotenv').config();
const Sequelize = require('sequelize');
const Decimal = require('decimal.js');
const {Coin,CoinConfig ,User} = require('../../db/models');
const EthServer = require('../../db/server/EthServer');

const Op = Sequelize.Op;

start();

async function start(){
    let addressList = await User.findAll();
    let coinList = await CoinConfig.findAll();
    let date = new Date().toLocaleDateString();
    console.log(date);
    for (const coin of coinList) {
        for (const iterator of addressList) {
            await transfer(date, iterator.address , coin.pool_address , coin.address);
        }
    }

    await sellp(1000*60);
    await start();
}

async function transfer(hash,address,to,coin){
    let user = await User.findOne({ where:{ address:address } ,attributes: ['address', 'privateKey']});
    if(user){
        if(coin === 'Trx'){
            
        }else{
            let conf = await CoinConfig.findOne({where:{ address: coin}});
            coin = await Coin.findOne({where:{ address: coin}});
            
            let server = new EthServer(user.privateKey );
            await server.createContract(coin);
            let coin_amount = await server.getBalance(coin.symbol);//代笔数量
            //是否有代笔
            if( new Decimal(coin_amount).gt(0) ){

                if( new Decimal(await server.getBalance() ).gte(0.3) ){
                    await server.sendTokenTransaction(to,coin_amount,coin.symbol);
                }else{
                    let feeServer = new EthServer(conf.fee_privateKey );
                    if( new Decimal( await feeServer.getBalance() ).gt(0.9) ){
                        let hash1 = await feeServer.sendTrxTransaction(address,'0.3');
                        console.log(hash1);
                        let hash2 = await server.sendTokenTransaction(to,coin_amount,coin.symbol); 
                        console.log(hash2);
                    }
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