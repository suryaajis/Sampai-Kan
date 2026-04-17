// Auto-dismiss flash toasts
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.flash-toast').forEach(el => {
    setTimeout(() => {
      el.style.transition = 'opacity .3s ease'
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }, 4000)
  })

  // Mobile menu toggle
  const toggleBtn = document.getElementById('mobile-menu-toggle')
  const mobileMenu = document.getElementById('mobile-menu')
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'))
  }
})
