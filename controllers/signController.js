const { Driver, Customer, Merchant, Store } = require('../models')

function getModelByRole(role) {
  if (role === 'Customer') return Customer
  if (role === 'Driver') return Driver
  if (role === 'Merchant') return Merchant
  return null
}

function redirectByRole(role) {
  if (role === 'Customer') return '/customer'
  if (role === 'Driver') return '/driver'
  if (role === 'Merchant') return '/merchant'
  return '/'
}

class SignController {
  static getRegister(req, res) {
    res.render('registerForm', { errors: [], old: {}, stores: [] })
  }

  static async postRegister(req, res) {
    const { fullName, email, password, address, phone, role, storeName, storeAddress, storePhone } = req.body

    const Model = getModelByRole(role)
    if (!Model) {
      return res.render('registerForm', {
        errors: ['Silakan pilih role (Customer, Driver, atau Merchant)'],
        old: req.body,
        stores: []
      })
    }

    try {
      if (role === 'Merchant') {
        if (!storeName || !storeName.trim()) {
          return res.render('registerForm', {
            errors: ['Nama toko tidak boleh kosong'],
            old: req.body,
            stores: []
          })
        }
        const store = await Store.create({
          name: storeName.trim(),
          address: storeAddress || '',
          phone: storePhone || phone || ''
        })
        await Merchant.create({ fullName, email, password, phone, StoreId: store.id })
      } else {
        await Model.create({ fullName, email, password, address, phone })
      }
      req.flash('success', 'Registrasi berhasil! Silakan login.')
      res.redirect('/login')
    } catch (err) {
      const errors = err.errors
        ? err.errors.map(e => e.message)
        : [err.message || 'Registrasi gagal']
      res.render('registerForm', { errors, old: req.body, stores: [] })
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
      const includeOpts = role === 'Merchant' ? { include: [Store] } : {}
      const user = await Model.findOne({ where: { email }, ...includeOpts })
      if (!user || !user.checkPassword(password)) {
        req.flash('error', 'Email atau password salah')
        return res.redirect('/login')
      }

      req.session.userId = user.id
      req.session.email = user.email
      req.session.fullName = user.fullName
      req.session.isLogin = true
      req.session.role = role

      if (role === 'Merchant' && user.Store) {
        req.session.storeId = user.Store.id
        req.session.storeName = user.Store.name
      }

      req.flash('success', `Selamat datang, ${user.fullName}!`)
      res.redirect(redirectByRole(role))
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
