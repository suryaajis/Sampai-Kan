module.exports = (req, res, next) => {
  if (req.session.isLogin && req.session.role === 'Merchant') return next()
  req.flash('error', 'Silakan login sebagai pemilik toko terlebih dahulu')
  res.redirect('/login')
}
