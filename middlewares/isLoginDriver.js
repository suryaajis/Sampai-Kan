function isLoginDriver(req, res, next) {
  if (req.session && req.session.isLogin && req.session.role === 'Driver') {
    return next()
  }
  req.flash('error', 'Area khusus driver. Silakan login sebagai driver.')
  return res.redirect('/login')
}

module.exports = isLoginDriver
