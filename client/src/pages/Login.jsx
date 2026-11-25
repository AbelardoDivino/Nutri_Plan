import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { login, googleLogin } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const googleRef = useRef(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!window.google || !googleRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true)
          try {
            const user = await googleLogin(response.credential)
            navigate(user.role === 'admin' ? '/admin' : '/app', { replace: true })
          } catch (err) {
            toast.show(err.message, 'error')
          } finally {
            setLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'signin_with',
      })
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [clientId])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/app', { replace: true })
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'linear-gradient(135deg, #ecfdf5, #f4f6f1)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>NutriPlan</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acesse sua conta</div>
          </div>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            <LogIn size={18} /> {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {clientId && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <div ref={googleRef} />
          </div>
        )}
        {!clientId && (
          <div style={{ marginTop: 16, fontSize: '0.78rem', color: 'var(--text-soft)', textAlign: 'center' }}>
            Login com Google disponível após configurar VITE_GOOGLE_CLIENT_ID.
          </div>
        )}
        <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-soft)', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary)' }}>Esqueceu a senha?</Link>
        </div>
        <div style={{ marginTop: 8, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Não tem conta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Criar conta</Link>
        </div>
      </div>
    </div>
  )
}