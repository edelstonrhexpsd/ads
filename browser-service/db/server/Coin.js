const TronNode = require('./TronNode');
const Decimal = require('decimal.js');

class Coin extends TronNode{
    constructor( privateKey='',type=1 ) {
        super(privateKey,type);
    }

    isAddress(address){
        return this.tronWeb.isAddress(address);
    }
    
    async getContract(address){
        try {
            return await this.tronWeb.trx.getContract( address );
        } catch (error) {
            return false;
        }
    }


    async createContract(abi,address){
        this.myContract  = await this.tronWeb.contract(abi,address);
    }
    
    
    async getName(){
        return await this.myContract.name().call();
    }

    async getSymbol(){
        return await this.myContract.symbol().call();
    }

    async getDecimals(){
        return await this.myContract.decimals().call();
    }

    async getTotalSupply(){
        return Decimal.div( (await this.myContract.totalSupply().call()).toString(),10** await this.getDecimals() ).toString() ;
    }

}

module.exports = Coin;