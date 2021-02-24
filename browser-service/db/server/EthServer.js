const TronNode = require('./TronNode');
const Crypto = require('../../db/server/Crypto');
const Decimal = require('decimal.js');
const {Coin} = require('../../db/models');
//const rpc = require('node-json-rpc');

class EthServer extends TronNode{

    constructor( privateKey='',type=1 ) {
        super(privateKey,type);
        this.coin = new Map();
        this.contract = new Map();
    }


    /**
     * 创建合约
     * @param {合约数据} coinItem 
     * @requires 没有返回值
     */
    async createContract(coinItem){
        this.coin.set(coinItem.symbol, coinItem);
        this.contract.set(coinItem.symbol,await this.tronWeb.contract(JSON.parse(coinItem.abi),coinItem.address));
    }
   
    /**
     * 删除合约
     * @param {合约名称} symbol 
     * @returns 没有返回值
     */
    deleteContract(symbol){
        this.coin.delete(symbol);
        this.contract.delete(symbol);
    }

    /**
     * 创建平台所有的合约
     */
    async createAllContract(){
        let list = await Coin.findAll({ where: {type: this.nodeType }});
        for (const iterator of list) {
            await this.createContract(iterator);
        }
    }

    /**
     * 获取账号余额
     * @param {币种默认ETH} symbol 
     * @param {地址默认创建合约的地址} address 
     * @returns String
     */
    async getBalance(symbol='Trx',address=''){
        address = address?address:this.address;
        if(symbol==='Trx'){
            return Decimal(this.tronWeb.fromSun(await this.tronWeb.trx.getBalance(address))).toFixed();
        }else{
            return Decimal.div( (await this.contract.get(symbol).balanceOf(address).call()).toString() ,10** this.coin.get(symbol).decimal).toFixed();
        }
    }

    /**
     * 分配地址
     * @param
     * @returns Object or Null or False
     */
    async creatAddress(){
        return await this.tronWeb.createAccount()
    }

    /**
     * 判断地址是否正确
     * @param {地址} address 
     * @returns Boolean
     */
    isAddress(address){
        return this.tronWeb.isAddress(address);
    }

    /**
     * 分配设置默认私钥
     * @param
     * @returns Object or Null or False
     */
    // async setPrivateKey(PrivateKey){
    //     PrivateKey = PrivateKey.length>66 ? Crypto.decrypt(PrivateKey) : PrivateKey;
    //     return await this.tronWeb.setPrivateKey(PrivateKey);
    // }

    /**
     * 分配设置默认私钥
     * @param
     * @returns Object or Null or False
     */
    async setPrivateKey(PrivateKey){
        PrivateKey = PrivateKey.length>66 ? Crypto.decrypt(PrivateKey) : PrivateKey;
        this.privateKey = PrivateKey;
        this.address = this.tronWeb.address.fromPrivateKey(this.privateKey);
        return await this.tronWeb.setPrivateKey(PrivateKey);
    }

    /**
     *  质押资源或者带宽
     * @param {*} amount 数量单位Trx
     * @param {*} duration 质押时间最少3天
     * @param {*} resource 质押资源类型 必须是`BANDWIDTH`或`ENERGY`
     * @param {*} ownerAddress 抠Trx的地址
     * @param {*} receiverAddress 获得资源的地址
     */
    async freezeBalance(amount, duration=3, resource, ownerAddress, receiverAddress){
        let tradeobj = await this.tronWeb.transactionBuilder.freezeBalance(this.tronWeb.toSun(amount), duration, resource, ownerAddress,receiverAddress );
        let signedtxn = await this.tronWeb.trx.sign(tradeobj, this.privateKey);
        let receipt = await this.tronWeb.trx.sendRawTransaction(signedtxn);
        return receipt;
    }
    /**
     * 释放资源
     * @param {*} resource 释放资源类型 必须是`BANDWIDTH`或`ENERGY`
     * @param {*} address trx拥有者的地址
     * @param {*} receiverAddress 资源获得者的地址
     */
    async unfreezeBalance(resource,address,receiverAddress){
        let tradeobj = await this.tronWeb.transactionBuilder.unfreezeBalance(resource,address,receiverAddress,1);
        let signedtxn = await this.tronWeb.trx.sign(tradeobj, this.privateKey);
        let receipt = await this.tronWeb.trx.sendRawTransaction(signedtxn);
        return receipt;
    }

    /**
     * 发送Trx交易
     * @param {to} to 
     * @param {数量} amount 
     */
    async sendTrxTransaction(to,amount){
        let tradeobj = await this.tronWeb.transactionBuilder.sendTrx(to,this.tronWeb.toSun(amount ));
        let signedtxn = await this.tronWeb.trx.sign(tradeobj, this.privateKey);
        let receipt = await this.tronWeb.trx.sendRawTransaction(signedtxn);
        return receipt.txid;
    }


    
    // async sendTokenTransaction(to,amount,symbol){       
    //     return await this.contract.get(symbol).transfer(to,Decimal.mul(amount, 10 ** this.coin.get(symbol).decimal).toFixed()).send({feeLimit: 1000000 });
    // }
    
    /**
     * 发送trc20Token交易
     * @param {to} to 
     * @param {数量} amount 
     */
    async sendTokenTransaction(to,amount,symbol){
        let parameter1 = [{type:'address',value:to},{type:'uint256',value:Decimal.mul(amount, 10 ** this.coin.get(symbol).decimal).toFixed() }]
        let tradeobj = (await this.tronWeb.transactionBuilder.triggerSmartContract(this.tronWeb.address.toHex((this.coin.get(symbol)).address) , "transfer(address,uint256)", {},
            parameter1,this.tronWeb.address.toHex(this.address) )).transaction;
        let signedtxn = await this.tronWeb.trx.sign(tradeobj, this.privateKey);
        let receipt = await this.tronWeb.trx.sendRawTransaction(signedtxn);
        return receipt.txid;
    }
    




    /**
     * 发送代笔归集 无手续费
     * @param {to} to 
     * @param {数量} amount 
     * @param {币种} symbol 
     */
    async sendCoinTransfer(pool,to,amount,obj){

        this.web3.eth.sendSignedTransaction('0x' + await this.getSignString(to,amount,'ETH'))
            .on('transactionHash', hash=>{
                pool.msg = hash;
                pool.save();
                console.log(hash);
            })
            .on('receipt', async receipt=>{
                if(receipt.status == false){
                    pool.state = 2;
                    pool.save();
                }else{
                    this.address = this.toChecksumAddress(obj.user.address);
                    this.privateKey = Crypto.decrypt(obj.user.privateKey);
                    this.web3.eth.sendSignedTransaction('0x' + await this.getSignString(obj.to,obj.amount,obj.coin))
                        .on('transactionHash', hash=>{
                            pool.pool_hash = hash;
                            pool.save();
                            console.log(hash);

                        })
                        .on('receipt', receipt=>{
                            if(receipt.status == false){
                                pool.state = 2;
                                pool.save();
                            }else{
                                pool.state = 1;
                                pool.save();
                            }
                        })
                        .on('error', error=>{
                            pool.state = 2;
                            pool.save();
                        });
                }
            })
            .on('error', error=>{
                pool.state = 2;
                pool.save();
            });
    }


}
module.exports=EthServer;