'use strict';
module.exports = (sequelize, DataTypes) => {
  const Coin = sequelize.define('Coin', {
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    address: DataTypes.STRING,
    amount: DataTypes.DOUBLE(18,6),
    decimal: DataTypes.INTEGER,
    abi: DataTypes.TEXT
  }, {
    tableName: 'coin',
    comment: "代币信息",
    sequelize 
  });
  Coin.associate = function(models) {
    // associations can be defined here
  };
  return Coin;
};