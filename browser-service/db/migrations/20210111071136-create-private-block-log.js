'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('private_block_log', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      blockNumber: {
        allowNull: false,
        comment: '区块高度',
        type: Sequelize.INTEGER
      },
      blockHash: {
        allowNull: false,
        comment: '哈希',
        type: Sequelize.STRING
      },
      txTrieRoot:{
        allowNull: false,
        comment: '根目录',
        type: Sequelize.STRING
      },
      witnessAddress:{
        allowNull: false,
        comment: '挖矿地址',
        type: Sequelize.STRING
      },
      parentHash:{
        allowNull: false,
        comment: '上个块的hash',
        type: Sequelize.STRING
      },
      blockTimestamp:{
        allowNull: false,
        comment: '出块时间戳',
        type: Sequelize.STRING
      },
      transactionsNum:{
        allowNull: false,
        comment: '交易数量',
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('private_block_log');
  }
};