function formatPrice(value) {
  const num = Number(value) || 0
  return 'Rp ' + num.toLocaleString('id-ID')
}

module.exports = formatPrice
