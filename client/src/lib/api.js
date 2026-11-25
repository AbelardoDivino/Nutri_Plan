let token = null
export const setToken = (t) => {
  token = t
}

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const BASE = API_ROOT ? `${API_ROOT}/api` : '/api'

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
  let data = null
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || 'Erro na requisição'
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  delete: (p, b) => request('DELETE', p, b),
}

export function money(n) {
  return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}