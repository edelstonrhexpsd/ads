'use strict';
module.exports = (sequelize, DataTypes) => {
  const TronBlockLog = sequelize.define('TronBlockLog', {
    blockNumber: DataTypes.INTEGER
  }, {
    tableName: 'tron_block_log',
    comment: "处理过的区块高度",
    sequelize 
  });
  TronBlockLog.associate = function(models) {
    // associations can be defined here
  };
  return TronBlockLog;
};