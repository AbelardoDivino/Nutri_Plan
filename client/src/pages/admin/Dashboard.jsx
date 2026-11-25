import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { Users, Inbox, Salad, MessageSquare, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="screen-loader"><div className="spinner" /></div>
  if (!data) return null

  const s = data.stats
  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Visão geral do consultório.</p>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card green">
          <div className="icon"><Users size={20} /></div>
          <div className="label">Pacientes ativos</div>
          <div className="value">{s.activePatients}</div>
          <div className="hint">de {s.totalPatients} cadastrados</div>
        </div>
        <div className="stat-card blue">
          <div className="icon"><Salad size={20} /></div>
          <div className="label">Dietas ativas</div>
          <div className="value">{s.activeDiets}</div>
          <div className="hint">planos em vigor</div>
        </div>
        <div className="stat-card amber">
          <div className="icon"><Inbox size={20} /></div>
          <div className="label">Contatos novos</div>
          <div className="value">{s.newLeads}</div>
          <div className="hint">aguardando retorno</div>
        </div>
        <div className="stat-card red">
          <div className="icon"><MessageSquare size={20} /></div>
          <div className="label">Mensagens não lidas</div>
          <div className="value">{s.unreadMessages}</div>
          <div className="hint">de pacientes</div>
        </div>
      </div>

      {data.patientsWithoutDiet?.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--accent)' }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="var(--accent)" /> Pacientes sem dieta ativa
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.patientsWithoutDiet.map((p) => (
              <button key={p.id} className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/patients/${p.id}`)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pacientes recentes</div>
          </div>
          {data.recentPatients.length === 0 ? (
            <div className="empty">Nenhum paciente cadastrado.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nome</th><th>E-mail</th><th>Objetivo</th></tr>
                </thead>
                <tbody>
                  {data.recentPatients.map((p) => (
                    <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/patients/${p._id}`)}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.goal || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Contatos recentes</div>
          </div>
          {data.recentLeads.length === 0 ? (
            <div className="empty">Nenhum contato.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nome</th><th>Status</th><th>Objetivo</th></tr>
                </thead>
                <tbody>
                  {data.recentLeads.map((l) => (
                    <tr key={l._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/leads')}>
                      <td>{l.name}</td>
                      <td><span className={`badge badge-${l.status === 'novo' ? 'amber' : l.status === 'cliente' ? 'green' : 'gray'}`}>{l.status}</span></td>
                      <td>{l.goal || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}