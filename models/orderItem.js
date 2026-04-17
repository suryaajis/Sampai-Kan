'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'OrderId' })
      OrderItem.belongsTo(models.Item, { foreignKey: 'ItemId' })
    }
  }

  OrderItem.init({
    OrderId: DataTypes.INTEGER,
    ItemId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    subtotal: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'OrderItem'
  })

  return OrderItem
}
