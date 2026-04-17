function isLoginCustomer(req, res, next) {
  if (req.session && req.session.isLogin && req.session.role === 'Customer') {
    return next()
  }
  req.flash('error', 'Area khusus customer. Silakan login sebagai customer.')
  return res.redirect('/login')
}

module.exports = isLoginCustomer
