'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.hasMany(models.Item, { foreignKey: 'StoreId' })
      Store.hasMany(models.Order, { foreignKey: 'StoreId' })
      Store.hasMany(models.Merchant, { foreignKey: 'StoreId' })
    }
  }

  Store.init({
    name: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: 'Nama toko tidak boleh kosong' } }
    },
    description: DataTypes.TEXT,
    logoUrl: DataTypes.STRING,
    address: DataTypes.TEXT,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Store'
  })

  return Store
}
