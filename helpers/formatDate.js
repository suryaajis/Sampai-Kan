function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ]
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} • ${hh}:${mm}`
}

module.exports = formatDate
