import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import LineChart from '../../components/LineChart.jsx'
import { Plus, Trash2, TrendingUp } from 'lucide-react'

export default function Progress() {
  const toast = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: '', bodyFat: '', waist: '', chest: '', hip: '', arm: '', notes: '' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('/my/progress')
      setLogs(data.logs)
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    try {
      await api.post('/my/progress', form)
      toast.show('Registro adicionado.', 'success')
      setForm({ date: new Date().toISOString().slice(0, 10), weight: '', bodyFat: '', waist: '', chest: '', hip: '', arm: '', notes: '' })
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const remove = async (id) => {
    if (!confirm('Excluir este registro?')) return
    try {
      await api.delete(`/progress/${id}`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  if (loading) return <div className="screen-loader"><div className="spinner" /></div>

  return (
    <div>
      <h1 style={{ marginBottom: 18 }}>Minha evolução</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Novo registro</div></div>
        <div className="grid-3">
          <div className="field"><label>Data</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="field"><label>Peso (kg)</label><input type="number" className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
          <div className="field"><label>% Gordura</label><input type="number" className="input" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} /></div>
          <div className="field"><label>Cintura (cm)</label><input type="number" className="input" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} /></div>
          <div className="field"><label>Peito (cm)</label><input type="number" className="input" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} /></div>
          <div className="field"><label>Quadril (cm)</label><input type="number" className="input" value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} /></div>
          <div className="field"><label>Braço (cm)</label><input type="number" className="input" value={form.arm} onChange={(e) => setForm({ ...form, arm: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Observações</label>
          <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={add}><Plus size={16} /> Adicionar</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Evolução do peso</div></div>
        <LineChart data={logs} valueKey="weight" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Evolução do % de gordura</div></div>
        <LineChart data={logs} valueKey="bodyFat" label="% Gordura" color="#ca8a04" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Data</th><th>Peso</th><th>% Gordura</th><th>Cintura</th><th>Peito</th><th>Quadril</th><th>Braço</th><th></th></tr>
          </thead>
          <tbody>
            {[...logs].reverse().map((p) => (
              <tr key={p._id}>
                <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                <td>{p.weight ?? '—'}</td>
                <td>{p.bodyFat ?? '—'}</td>
                <td>{p.waist ?? '—'}</td>
                <td>{p.chest ?? '—'}</td>
                <td>{p.hip ?? '—'}</td>
                <td>{p.arm ?? '—'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(p._id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}