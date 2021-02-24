'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('get_log', {
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
      contractRet:{
        allowNull: false,
        comment: '执行结果',
        type: Sequelize.STRING
      },
      contract: {
        allowNull: false,
        comment: '合约地址',
        type: Sequelize.STRING
      },
      hash: {
        allowNull: false,
        comment: '哈希',
        type: Sequelize.STRING
      },
      from: {
        allowNull: false,
        comment: 'from',
        type: Sequelize.STRING
      },
      to: {
        allowNull: false,
        comment: 'to',
        type: Sequelize.STRING
      },
      value: {
        allowNull: false,
        comment: '金额',
        type: Sequelize.DOUBLE(18,6)
      },
      transactionsTimestamp:{
        allowNull: false,
        comment: '时间戳',
        type: Sequelize.STRING
      },
      expands: {
        allowNull: false,
        comment: '数据',
        type: Sequelize.STRING(1234)
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
    return queryInterface.dropTable('get_log');
  }
};