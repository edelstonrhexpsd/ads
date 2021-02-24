'use strict';
module.exports = (sequelize, DataTypes) => {
  const PrivateBlockLog = sequelize.define('PrivateBlockLog', {
    blockNumber: DataTypes.INTEGER,
    blockHash: DataTypes.STRING,
    txTrieRoot:DataTypes.STRING,
    witnessAddress: DataTypes.STRING,
    parentHash: DataTypes.STRING,
    blockTimestamp: DataTypes.STRING,
    transactionsNum: DataTypes.INTEGER,
  }, {
    tableName: 'private_block_log',
    comment: "处理过的区块高度",
    sequelize 
  });
  PrivateBlockLog.associate = function(models) {
    // associations can be defined here
  };
  return PrivateBlockLog;
};