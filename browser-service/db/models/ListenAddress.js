'use strict';
module.exports = (sequelize, DataTypes) => {
  const ListenAddress = sequelize.define('ListenAddress', {
    uid: DataTypes.INTEGER,
    address: DataTypes.STRING,
    private_key: DataTypes.STRING,
    transaction_count: DataTypes.INTEGER,
    start_block : DataTypes.INTEGER,
    last_block: DataTypes.INTEGER,
  }, {
    tableName: 'listen_address',
    comment: "节点配置",
    timestamps: false,
    sequelize
  });
  ListenAddress.associate = function(models) {
    // associations can be defined here
  };
  return ListenAddress;
};
