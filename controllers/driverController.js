const { Driver, Order } = require('../models')
const formatDate = require('../helpers/formatDate')

class DriverController {
  static async profile(req, res, next) {
    try {
      const driver = await Driver.findByPk(req.session.userId)
      const deliveredCount = await Order.count({
        where: { DriverId: req.session.userId, status: 'delivered' }
      })
      res.render('drivers/profile', {
        driver,
        deliveredCount,
        formatDate,
        errors: []
      })
    } catch (err) {
      next(err)
    }
  }

  static async postProfile(req, res, next) {
    try {
      const { fullName, email, phone, profileUrl, password } = req.body
      const driver = await Driver.findByPk(req.session.userId)
      if (!driver) {
        req.flash('error', 'Akun tidak ditemukan')
        return res.redirect('/login')
      }

      driver.fullName = fullName
      driver.email = email
      driver.phone = phone
      if (profileUrl && profileUrl.trim() !== '') driver.profileUrl = profileUrl
      if (password && password.trim() !== '') driver.password = password

      await driver.save()
      req.session.fullName = driver.fullName
      req.session.email = driver.email
      req.flash('success', 'Profil berhasil diperbarui')
      res.redirect('/driver/profile')
    } catch (err) {
      const errors = err.errors
        ? err.errors.map(e => e.message)
        : [err.message || 'Gagal memperbarui profil']
      try {
        const driver = await Driver.findByPk(req.session.userId)
        const deliveredCount = await Order.count({
          where: { DriverId: req.session.userId, status: 'delivered' }
        })
        res.render('drivers/profile', { driver, deliveredCount, formatDate, errors })
      } catch (e) {
        next(e)
      }
    }
  }
}

module.exports = DriverController
