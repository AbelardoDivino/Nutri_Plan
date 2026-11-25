import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const { register, googleLogin } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', goal: '', consent: false })
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
      window.google.accounts.id.renderButton(googleRef.current, { theme: 'outline', size: 'large', width: 360, text: 'signup_with' })
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [clientId])

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.show('As senhas não conferem.', 'error')
      return
    }
    if (!form.consent) {
      toast.show('É necessário aceitar a política de privacidade.', 'error')
      return
    }
    setLoading(true)
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        goal: form.goal,
        consent: true,
      })
      toast.show('Conta criada com sucesso!', 'success')
      navigate(user.role === 'admin' ? '/admin' : '/app', { replace: true })
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'linear-gradient(135deg, #ecfdf5, #f4f6f1)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>NutriPlan</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Criar conta de paciente</div>
          </div>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>Nome completo</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Senha (mín. 8)</label>
              <input type="password" className="input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="field">
              <label>Confirmar senha</label>
              <input type="password" className="input" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Telefone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>Objetivo</label>
              <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Ex: Emagrecimento" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem' }}>
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} style={{ marginTop: 3 }} />
            <label>
              Li e aceito a <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Política de Privacidade</Link>.
            </label>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            <UserPlus size={18} /> {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        {clientId && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <div ref={googleRef} />
          </div>
        )}
        <div style={{ marginTop: 16, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Entrar</Link>
        </div>
      </div>
    </div>
  )
}