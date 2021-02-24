const TronWeb = require('tronweb');
const Crypto = require('../../db/server/Crypto');
const HttpProvider = TronWeb.providers.HttpProvider;
class TronNode{
    
    constructor(privateKey='',type) {
        privateKey = privateKey == '' ?'0e583d4d62ccd87b4cbbd61564f7b59c0fdaa082a89c332549a91f73d00ea0f7':privateKey;
        if(type==1){
            var fullNode = new HttpProvider(process.env.Full_Node);
            var solidityNode = new HttpProvider(process.env.Solidity_Node);
            var eventServer = process.env.Event_Server;
        }else{
            var fullNode = new HttpProvider(process.env.Private_Full_Node);
            var solidityNode = new HttpProvider(process.env.Private_Solidity_Node);
            var eventServer = process.env.Private_Event_Server;
        }
        privateKey = privateKey.length>66 ? Crypto.decrypt(privateKey) : privateKey ;
        this.tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer,
            privateKey
        );
        this.privateKey = privateKey;
        this.address = this.tronWeb.address.fromPrivateKey(this.privateKey);
        this.nodeType = type;
    }
}

module.exports = TronNode;