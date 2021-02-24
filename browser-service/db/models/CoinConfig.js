'use strict';
module.exports = (sequelize, DataTypes) => {
  const CoinConfig = sequelize.define('CoinConfig', {
    type: DataTypes.INTEGER,
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    address: DataTypes.STRING,
    exchange_address: DataTypes.STRING,
    exchange_privateKey: DataTypes.STRING,
    wallet_address: DataTypes.STRING,
    wallet_privateKey: DataTypes.STRING
  }, {
    tableName: 'coin_config',
    comment: "代币配置",
    sequelize 
  });
  CoinConfig.associate = function(models) {
    // associations can be defined here
  };
  return CoinConfig;
};