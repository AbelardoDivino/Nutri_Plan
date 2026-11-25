import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function ForgotPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [devToken, setDevToken] = useState('')

  const request = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api.post('/auth/forgot-password', { email })
      setDevToken(data.resetToken || '')
      setStep(2)
      toast.show('Instruções enviadas. Verifique o código abaixo.', 'success')
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const reset = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, token, newPassword })
      toast.show('Senha redefinida! Faça login.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'linear-gradient(135deg, #ecfdf5, #f4f6f1)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <h2 style={{ marginBottom: 6 }}>Esqueceu a senha?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 18 }}>
          {step === 1 ? 'Informe seu e-mail para receber um código de redefinição.' : 'Digite o código e sua nova senha.'}
        </p>
        {step === 1 ? (
          <form onSubmit={request} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field">
              <label>E-mail</label>
              <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        ) : (
          <form onSubmit={reset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {devToken && (
              <div style={{ padding: 10, background: 'var(--primary-softer)', borderRadius: 8, fontSize: '0.82rem' }}>
                <strong>Código de redefinição (dev):</strong> {devToken}
              </div>
            )}
            <div className="field">
              <label>Código</label>
              <input className="input" required value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div className="field">
              <label>Nova senha (mín. 8)</label>
              <input type="password" className="input" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        )}
        <div style={{ marginTop: 16, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}