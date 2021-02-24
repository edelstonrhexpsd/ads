require('dotenv').config();
const { User,Coin} = require('../models');
const TronNode = require('./TronNode');
const Decimal = require('decimal.js');
const ethers = require('ethers')

const AbiCoder = ethers.utils.AbiCoder;
const ADDRESS_PREFIX_REGEX = /^(41)/;
const ADDRESS_PREFIX = "41";

class BlockServer extends TronNode{

    constructor( privateKey='',type=1 ) {
        super(privateKey,type);
    }
     /**
     * 加载服务器币种和地址
     */
    async init(){
        await this.getCoinList();
    }

    /**
     * 获取平台所有合约地址
     */
    async getCoinList(){
        let coinList = new Map();
        let coinObj = await Coin.findAll();
        coinObj.forEach(value => {
            coinList.set(value.address,value);
        });
        this.coinList = coinList;
    }

    /**
     * 判断是否是平台合约
     * @param {地址} address 
     */
    isSystemCoin(address){
        return this.coinList.has(this.toChecksumAddress(address));
    }

    /**
     * 判断是否是平台地址
     * @param {地址}} address 
     */
    async isSystemAddress(address){
        return await User.findOne({ where:{ address: address} })?true:false;
    }

    /**
     * 格式化钱包地址
     * @param {地址} address 
     */
    toChecksumAddress(address){
        return this.tronWeb.address.fromHex(address);
    }

    /**
     * 获取最新区块数据
     * @returns Number
     */
    async getNowBlockNumber(){
        return (await this.tronWeb.trx.getCurrentBlock() ).block_header.raw_data.number ;
    }

    /**
     * 获取指定区块数据
     * @param {区块高度} block 
     */
    async getBlock(block){
        return await this.tronWeb.trx.getBlock(block);
    }

    /**
     * 获取指定区块的交易数量
     * @param {区块高度} block 
     */
    async getBlockTransactionCount(block){
        return await this.tronWeb.trx.getBlockTransactionCount(block);
    }

    /**
     * 查询指定交易
     * @param {hash} hash
     * @returns Json Or Null Or False 
     */
    async getTransaction(hash){
        return await this.tronWeb.getEventByTransactionID(hash);
    }

    /**
     * 查询指定交易
     * @param {hash} hash
     * @returns Json Or Null Or False 
     */
    async getTransactionAll(hash){
        return await this.tronWeb.trx.getTransactionInfo(hash);
    }

    /**
     * 获取格式化数据
     * @param {交易详情}} transaction 
     * @param {交易类型} type 
     */
    async getTransactionInfo(hash){
        let receipt = await this.getTransaction(hash);
        let ret = new Array();
        for (const value of receipt) {
            if( value.name == 'Transfer' && this.isSystemCoin(value.contract) && await this.isSystemAddress(this.toChecksumAddress( value.result.to)) ){
                ret.push({
                    status: true,
                    contract: value.contract,
                    hash: value.transaction,
                    blockNumber: value.block,
                    from:  this.toChecksumAddress( value.result.from),
                    to: this.toChecksumAddress( value.result.to),
                    value: Decimal(value.result.value).div(10 ** this.coinList.get(value.contract).decimal ).toFixed()
                });
            }
        }
        return ret;
    }
    
    async decodeParams(types, output, ignoreMethodHash) {

        if (!output || typeof output === 'boolean') {
            ignoreMethodHash = output;
            output = types;
        }
        if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
            output = '0x' + output.replace(/^0x/, '').substring(8);
        const abiCoder = new AbiCoder();
        if (output.replace(/^0x/, '').length % 64)
            throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
        // output = output.replace(/0000041/, '0000000');
        return abiCoder.decode(types, output).reduce((obj, arg, index) => {
            if (types[index] == 'address')
                arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
            obj.push(arg);
            return obj;
        }, []);
    }
}
module.exports=BlockServer;