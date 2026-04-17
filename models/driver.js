'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    static associate(models) {
      Driver.hasMany(models.Order, { foreignKey: 'DriverId' })
    }

    checkPassword(raw) {
      return bcrypt.compareSync(raw, this.password)
    }
  }

  Driver.init({
    fullName: {
      type: DataTypes.STRING,
      validate: { notEmpty: { msg: 'Nama lengkap wajib diisi' } }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: { msg: 'Email wajib diisi' },
        isEmail: { msg: 'Format email tidak valid' }
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Nomor telepon wajib diisi' },
        isPhone(value) {
          if (!value) return
          if (value.startsWith('0')) {
            throw new Error('Tidak perlu awalan 0 pada nomor telepon')
          }
          if (value.startsWith('+62')) {
            throw new Error('Tidak perlu awalan +62 pada nomor telepon')
          }
        }
      }
    },
    ItemId: DataTypes.INTEGER,
    profileUrl: {
      type: DataTypes.STRING,
      defaultValue: 'https://api.dicebear.com/7.x/initials/svg?seed=Driver'
    },
    password: {
      type: DataTypes.STRING,
      defaultValue: '',
      validate: {
        notEmpty: { msg: 'Password wajib diisi' },
        passLength(value) {
          if (value && value.length < 6 && !value.startsWith('$2')) {
            throw new Error('Minimal 6 karakter untuk password')
          }
        }
      }
    }
  }, {
    hooks: {
      beforeCreate(instance) {
        if (instance.password) {
          const salt = bcrypt.genSaltSync(10)
          instance.password = bcrypt.hashSync(instance.password, salt)
        }
      },
      beforeUpdate(instance) {
        if (instance.changed('password') && instance.password && !instance.password.startsWith('$2')) {
          const salt = bcrypt.genSaltSync(10)
          instance.password = bcrypt.hashSync(instance.password, salt)
        }
      }
    },
    sequelize,
    modelName: 'Driver'
  })

  return Driver
}
