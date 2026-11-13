const THEME_KEY = 'theme'

function savedTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme = savedTheme()) {
  const isDark = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'
    button.setAttribute('aria-label', label)
    button.setAttribute('title', label)
  })
  return isDark ? 'dark' : 'light'
}

export function toggleTheme() {
  return applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')
}

window.toggleTheme = toggleTheme
