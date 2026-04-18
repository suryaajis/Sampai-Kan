'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'StoreId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Stores', key: 'id' },
      onUpdate: 'cascade',
      onDelete: 'set null'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Orders', 'StoreId');
  }
};
