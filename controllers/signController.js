const { Driver, Customer } = require('../models')

function getModelByRole(role) {
  if (role === 'Customer') return Customer
  if (role === 'Driver') return Driver
  return null
}

class SignController {
  static getRegister(req, res) {
    res.render('registerForm', { errors: [], old: {} })
  }

  static async postRegister(req, res) {
    const { fullName, email, password, address, phone, role } = req.body

    const Model = getModelByRole(role)
    if (!Model) {
      return res.render('registerForm', {
        errors: ['Silakan pilih role (Customer atau Driver)'],
        old: req.body
      })
    }

    try {
      await Model.create({ fullName, email, password, address, phone })
      req.flash('success', 'Registrasi berhasil! Silakan login.')
      res.redirect('/login')
    } catch (err) {
      const errors = err.errors
        ? err.errors.map(e => e.message)
        : [err.message || 'Registrasi gagal']
      res.render('registerForm', { errors, old: req.body })
    }
  }

  static getLogin(req, res) {
    res.render('loginForm', { old: {} })
  }

  static async postLogin(req, res) {
    const { email, password, role } = req.body
    const Model = getModelByRole(role)

    if (!Model) {
      req.flash('error', 'Silakan pilih role untuk login')
      return res.redirect('/login')
    }

    try {
      const user = await Model.findOne({ where: { email } })
      if (!user || !user.checkPassword(password)) {
        req.flash('error', 'Email atau password salah')
        return res.redirect('/login')
      }

      req.session.userId = user.id
      req.session.email = user.email
      req.session.fullName = user.fullName
      req.session.isLogin = true
      req.session.role = role

      req.flash('success', `Selamat datang, ${user.fullName}!`)
      res.redirect(role === 'Customer' ? '/customer' : '/driver')
    } catch (err) {
      console.error(err)
      req.flash('error', 'Terjadi kesalahan saat login')
      res.redirect('/login')
    }
  }

  static getLogout(req, res) {
    req.session.destroy(() => res.redirect('/login'))
  }
}

module.exports = SignController
