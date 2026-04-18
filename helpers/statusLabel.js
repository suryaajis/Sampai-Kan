const STATUS_META = {
  pending: { label: 'Menunggu Konfirmasi Toko', color: 'bg-amber-100 text-amber-700', icon: 'fa-clock' },
  preparing: { label: 'Sedang Disiapkan', color: 'bg-blue-100 text-blue-700', icon: 'fa-utensils' },
  picked_up: { label: 'Driver Mengambil Pesanan', color: 'bg-indigo-100 text-indigo-700', icon: 'fa-motorcycle' },
  delivering: { label: 'Dalam Perjalanan', color: 'bg-orange-100 text-orange-700', icon: 'fa-truck' },
  delivered: { label: 'Pesanan Selesai', color: 'bg-green-100 text-green-700', icon: 'fa-check-circle' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', icon: 'fa-times-circle' }
}

function statusLabel(status) {
  return STATUS_META[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: 'fa-circle' }
}

statusLabel.META = STATUS_META
statusLabel.STEPS = ['pending', 'preparing', 'picked_up', 'delivering', 'delivered']

module.exports = statusLabel
