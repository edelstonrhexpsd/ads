'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
   return queryInterface.bulkInsert('coin_config', [
    {
      type: 1,
      name: 'Trx',
      symbol: 'Trx',
      address: 'Trx',
      exchange_address: '请填写提币地址',
      exchange_privateKey: '请填写提币私钥',
      wallet_address: '请填写提币地址',
      wallet_privateKey: '请填写提币私钥',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
