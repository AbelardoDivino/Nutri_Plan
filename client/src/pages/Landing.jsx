import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { Salad, Dumbbell, HeartPulse, MessageCircle, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: '', message: '', consent: false })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await api.post('/contact', { ...form, consent: form.consent })
      setSent(true)
      toast.show('Mensagem enviada! Em breve entraremos em contato.', 'success')
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand">
          <div className="logo" style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#166534,#15803d)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</div>
          NutriPlan
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Entrar</button>
          <button className="btn btn-primary" onClick={() => document.getElementById('contato').scrollIntoView({ behavior: 'smooth' })}>
            Fale conosco
          </button>
        </div>
      </nav>

      <section className="hero">
        <div>
          <h1>Nutrição e treino <span className="accent">sob medida</span> para você.</h1>
          <p>
            Acompanhamento profissional com planos alimentares personalizados e treinos de academia pensados para
            o seu objetivo. Acompanhe sua evolução dia a dia, direto do celular.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Sou paciente <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Área do nutricionista
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div className="metric"><span>Calorias do dia</span><strong>1.620 / 1.600 kcal</strong></div>
          <div className="metric"><span>Proteína</span><strong>118 / 120 g</strong></div>
          <div className="metric"><span>Água</span><strong>1.75 L / 2.0 L</strong></div>
          <div className="metric"><span>Treino de hoje</span><strong>Treino A · Peito</strong></div>
          <div className="metric"><span>Peso atual</span><strong>69.4 kg (-2.6 kg)</strong></div>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature">
          <div className="icon"><Salad size={22} /></div>
          <h3>Plano alimentar personalizado</h3>
          <p>Refeições, macros e calorias calculados para o seu objetivo, com lista de alimentos e porções.</p>
        </div>
        <div className="feature">
          <div className="icon"><Dumbbell size={22} /></div>
          <h3>Treinos de academia</h3>
          <p>Programas por dia, com exercícios, séries, repetições, carga e descanso organizados.</p>
        </div>
        <div className="feature">
          <div className="icon"><TrendingUp size={22} /></div>
          <h3>Evolução acompanhada</h3>
          <p>Registre peso e medidas, visualize gráficos e acompanhe seu progresso ao longo do tempo.</p>
        </div>
        <div className="feature">
          <div className="icon"><MessageCircle size={22} /></div>
          <h3>Contato direto</h3>
          <p>Converse com sua nutricionista pelo chat e envie dúvidas a qualquer momento.</p>
        </div>
      </section>

      <section className="section" id="contato">
        <h2>Fale com a nutricionista</h2>
        <p className="lead">Preencha o formulário e receba um retorno com a proposta de acompanhamento.</p>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Como funciona</h3>
            <p>1. Envie seus dados e objetivo.</p>
            <p>2. A nutricionista analisa e entra em contato.</p>
            <p>3. Você recebe acesso à sua área com dieta e treino.</p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Atendimento humanizado', 'Planos individualizados', 'Acompanhamento contínuo'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} color="var(--primary)" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            {sent ? (
              <div className="empty">
                <CheckCircle2 size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <h3>Mensagem enviada!</h3>
                <p>Em breve entraremos em contato.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="grid-2">
                  <div className="field">
                    <label>Nome</label>
                    <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>E-mail</label>
                    <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid-2" style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>Telefone</label>
                    <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Objetivo</label>
                    <select className="select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                      <option value="">Selecione</option>
                      <option>Emagrecimento</option>
                      <option>Hipertrofia</option>
                      <option>Saúde geral</option>
                      <option>Performance</option>
                    </select>
                  </div>
                </div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Mensagem</label>
                  <textarea className="textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem' }}>
                  <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} style={{ marginTop: 3 }} />
                  <label>
                    Li e aceito a <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Política de Privacidade</Link> e autorizo o uso dos meus dados para contato.
                  </label>
                </div>
                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-primary" type="submit" disabled={sending || !form.consent}>
                    {sending ? 'Enviando...' : 'Enviar mensagem'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} NutriPlan — Nutrição e treino sob medida. · <Link to="/privacy" style={{ color: 'var(--primary)' }}>Política de Privacidade</Link>
      </footer>
    </div>
  )
}