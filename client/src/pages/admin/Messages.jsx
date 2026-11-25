import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Chat from '../../components/Chat.jsx'
import { MessageSquare } from 'lucide-react'

export default function Messages() {
  const toast = useToast()
  const [conversations, setConversations] = useState([])
  const [patients, setPatients] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await api.get('/messages/conversations')
      setConversations(data.conversations)
      setPatients(data.patients)
      if (!active && data.conversations.length) setActive(data.conversations[0].patient._id)
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  if (loading) return <div className="screen-loader"><div className="spinner" /></div>

  return (
    <div>
      <h1 style={{ marginBottom: 18 }}>Mensagens</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, minHeight: 560 }}>
        <div className="card" style={{ padding: 10, overflowY: 'auto' }}>
          <div style={{ padding: '6px 8px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Conversas
          </div>
          {conversations.length === 0 && (
            <div className="empty" style={{ padding: 20 }}>Nenhuma conversa ainda.</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.patient._id}
              onClick={() => setActive(c.patient._id)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: active === c.patient._id ? 'var(--primary-soft)' : 'transparent',
                marginBottom: 2,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem' }}>{c.patient.name}</strong>
                {c.unread > 0 && <span className="badge badge-red">{c.unread}</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.lastMessage?.text}
              </div>
            </div>
          ))}
          <div style={{ padding: '6px 8px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 10 }}>
            Iniciar nova
          </div>
          {patients
            .filter((p) => !conversations.find((c) => c.patient._id === p._id))
            .map((p) => (
              <div
                key={p._id}
                onClick={() => setActive(p._id)}
                style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}
              >
                {p.name}
              </div>
            ))}
        </div>
        <div>
          {active ? (
            <Chat patientId={active} title={patients.find((p) => p._id === active)?.name || ''} />
          ) : (
            <div className="card empty">
              <MessageSquare size={40} className="icon" />
              <h3>Selecione uma conversa</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}