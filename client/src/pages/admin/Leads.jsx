import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Inbox, UserPlus, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal.jsx'

const STATUSES = ['novo', 'contatado', 'cliente', 'descartado']

export default function Leads() {
  const toast = useToast()
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [convertPwd, setConvertPwd] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('/leads' + (filter ? `?status=${filter}` : ''))
      setLeads(data.leads)
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (lead, status) => {
    try {
      await api.put(`/leads/${lead._id}`, { status })
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const convert = async () => {
    if (!selected) return
    try {
      const data = await api.post(`/leads/${selected._id}/convert`, convertPwd ? { password: convertPwd } : {})
      toast.show(`Paciente criado. Senha inicial: ${data.tempPassword}`, 'success')
      setSelected(null)
      setConvertPwd('')
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const remove = async (id) => {
    if (!confirm('Excluir este contato?')) return
    try {
      await api.delete(`/leads/${id}`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Contatos</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quem entrou em contato pelo site.</p>
        </div>
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 180 }}>
          <option value="">Todos</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="screen-loader"><div className="spinner" /></div>
      ) : leads.length === 0 ? (
        <div className="card empty">
          <Inbox size={40} className="icon" />
          <h3>Nenhum contato</h3>
          <p>Os contatos do site aparecerão aqui.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Objetivo</th><th>Status</th><th>Data</th><th></th></tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l._id}>
                  <td><strong>{l.name}</strong></td>
                  <td>{l.email}</td>
                  <td>{l.phone || '—'}</td>
                  <td>{l.goal || '—'}</td>
                  <td>
                    <select className="select" value={l.status} onChange={(e) => updateStatus(l, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{new Date(l.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    {l.status !== 'cliente' && (
                      <button className="btn btn-primary btn-sm" onClick={() => setSelected(l)}>
                        <UserPlus size={14} /> Converter
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(l._id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Converter em paciente">
        {selected && (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              Será criado um paciente com os dados de <strong>{selected.name}</strong> ({selected.email}).
            </p>
            <div className="field">
              <label>Senha inicial (opcional)</label>
              <input className="input" value={convertPwd} onChange={(e) => setConvertPwd(e.target.value)} placeholder="gerada automaticamente" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={convert}>Converter</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}