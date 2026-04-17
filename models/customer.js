'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Item, { foreignKey: 'CustomerId' })
      Customer.hasMany(models.Order, { foreignKey: 'CustomerId' })
    }

    formatDate() {
      const date = new Date(this.createdAt)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    checkPassword(raw) {
      return bcrypt.compareSync(raw, this.password)
    }
  }

  Customer.init({
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
    address: {
      type: DataTypes.TEXT,
      validate: { notEmpty: { msg: 'Alamat wajib diisi' } }
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
    modelName: 'Customer'
  })

  return Customer
}
