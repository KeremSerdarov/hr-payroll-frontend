const baseURL = import.meta.env.VITE_API_URL

export default async function api(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  }
  const token = localStorage.getItem('token')

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers,
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`)
    error.status = response.status
    error.errors = data.errors || null
    throw error
  }

  return data
}
