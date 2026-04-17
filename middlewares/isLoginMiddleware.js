function isLoginMiddleware(req, res, next) {
  if (req.session && req.session.isLogin) {
    return next()
  }
  req.flash('error', 'Silakan login terlebih dahulu')
  return res.redirect('/login')
}

module.exports = isLoginMiddleware
