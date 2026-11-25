import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Plus, Search, Users } from 'lucide-react'
import Modal from '../../components/Modal.jsx'

export default function Patients() {
  const navigate = useNavigate()
  const toast = useToast()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', goal: '', height: '', startWeight: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('/patients' + (search ? `?search=${encodeURIComponent(search)}` : ''))
      setPatients(data.patients)
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search])

  const create = async () => {
    if (!form.name || !form.email) {
      toast.show('Nome e e-mail são obrigatórios.', 'error')
      return
    }
    setSaving(true)
    try {
      const data = await api.post('/patients', form)
      toast.show(`Paciente criado. Senha inicial: ${data.tempPassword}`, 'success')
      setModal(false)
      setForm({ name: '', email: '', password: '', phone: '', goal: '', height: '', startWeight: '', notes: '' })
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Pacientes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie seus pacientes e planos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Novo paciente
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} color="var(--text-soft)" />
          <input className="input" placeholder="Buscar por nome, e-mail ou objetivo..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', boxShadow: 'none', padding: 0 }} />
        </div>
      </div>

      {loading ? (
        <div className="screen-loader"><div className="spinner" /></div>
      ) : patients.length === 0 ? (
        <div className="card empty">
          <Users size={40} className="icon" />
          <h3>Nenhum paciente encontrado</h3>
          <p>Cadastre um novo paciente para começar.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Objetivo</th>
                <th>Dieta ativa</th>
                <th>Treino ativo</th>
                <th>Último peso</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/patients/${p._id}`)}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.email}</td>
                  <td>{p.goal || '—'}</td>
                  <td>{p.activeDiet ? <span className="badge badge-green">{p.activeDiet.title}</span> : <span className="badge badge-gray">Sem dieta</span>}</td>
                  <td>{p.activeWorkout ? <span className="badge badge-blue">{p.activeWorkout.title}</span> : <span className="badge badge-gray">Sem treino</span>}</td>
                  <td>{p.lastProgress?.weight ? `${p.lastProgress.weight} kg` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Novo paciente">
        <div className="grid-2">
          <div className="field">
            <label>Nome completo</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Senha inicial (opcional)</label>
            <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="gerada automaticamente" />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Objetivo</label>
            <input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          </div>
          <div className="field">
            <label>Altura (cm)</label>
            <input type="number" className="input" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
          </div>
          <div className="field">
            <label>Peso inicial (kg)</label>
            <input type="number" className="input" value={form.startWeight} onChange={(e) => setForm({ ...form, startWeight: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Observações</label>
          <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={create} disabled={saving}>{saving ? 'Salvando...' : 'Criar paciente'}</button>
        </div>
      </Modal>
    </div>
  )
}