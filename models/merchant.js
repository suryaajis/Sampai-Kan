'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Merchant extends Model {
    static associate(models) {
      Merchant.belongsTo(models.Store, { foreignKey: 'StoreId' })
    }

    checkPassword(plain) {
      return bcrypt.compareSync(plain, this.password)
    }
  }

  Merchant.init({
    fullName: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: 'Nama lengkap tidak boleh kosong' } }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: { msg: 'Format email tidak valid' } }
    },
    password: {
      type: DataTypes.STRING,
      validate: { len: { args: [6, 100], msg: 'Password minimal 6 karakter' } }
    },
    phone: DataTypes.STRING,
    profileUrl: DataTypes.STRING,
    StoreId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Merchant',
    hooks: {
      beforeCreate(merchant) {
        if (merchant.password) {
          merchant.password = bcrypt.hashSync(merchant.password, 10)
        }
      },
      beforeUpdate(merchant) {
        if (merchant.changed('password') && merchant.password && !merchant.password.startsWith('$2')) {
          merchant.password = bcrypt.hashSync(merchant.password, 10)
        }
      }
    }
  })

  return Merchant
}
