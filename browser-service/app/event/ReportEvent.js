require('dotenv').config();
const Sequelize = require('sequelize');
const schedule = require('node-schedule');
const Decimal = require('decimal.js');
const {Coin,CoinConfig ,PoolLog,User,EverydayPoolLog} = require('../../db/models');
const EthServer = require('../../db/server/EthServer');

const Op = Sequelize.Op;

//每日报表
schedule.scheduleJob('0 1 * * *', async ()=>{
    let addressList = await User.findAll();
    let coinList = await CoinConfig.findAll();
    let date = new Date().toLocaleDateString();
    let log = {};
    let server = new EthServer('0e583d4d62ccd87b4cbbd61564f7b59c0fdaa082a89c332549a91f73d00ea0f7');
    await server.createAllContract();
    for (const coin of coinList) {
        log[coin.symbol] = '0';
        for (const iterator of addressList) {
            log[coin.symbol] = Decimal.add(await server.getBalance(coin.symbol,iterator.address) , log[coin.symbol]);
        }
    }
    await EverydayPoolLog.create({date: date,data:JSON.stringify(log) });
    
});

