import { useState } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { Plus, Trash2 } from 'lucide-react'

const emptyEx = () => ({ name: '', sets: 3, reps: '10-12', load: '', rest: '60s', notes: '' })
const emptyDay = () => ({ label: 'Treino A', focus: '', notes: '', exercises: [emptyEx()] })

export default function WorkoutEditor({ patientId, initial, onSaved, onCancel }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: initial?.title || 'Novo plano de treino',
    objective: initial?.objective || 'Hipertrofia',
    level: initial?.level || 'Iniciante',
    notes: initial?.notes || '',
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '',
    active: initial?.active !== false,
    days: initial?.days?.length ? initial.days : [emptyDay()],
  })
  const [saving, setSaving] = useState(false)

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const updateDay = (di, patch) => setForm((f) => { const days = [...f.days]; days[di] = { ...days[di], ...patch }; return { ...f, days } })
  const removeDay = (di) => setForm((f) => ({ ...f, days: f.days.filter((_, i) => i !== di) }))
  const addDay = () => setForm((f) => ({ ...f, days: [...f.days, emptyDay()] }))
  const updateEx = (di, ei, patch) => setForm((f) => {
    const days = [...f.days]; const exs = [...days[di].exercises]; exs[ei] = { ...exs[ei], ...patch }; days[di] = { ...days[di], exercises: exs }; return { ...f, days }
  })
  const removeEx = (di, ei) => setForm((f) => {
    const days = [...f.days]; days[di] = { ...days[di], exercises: days[di].exercises.filter((_, i) => i !== ei) }; return { ...f, days }
  })
  const addEx = (di) => setForm((f) => {
    const days = [...f.days]; days[di] = { ...days[di], exercises: [...days[di].exercises, emptyEx()] }; return { ...f, days }
  })

  const save = async () => {
    if (!form.title.trim()) { toast.show('Informe o título do treino.', 'error'); return }
    setSaving(true)
    try {
      let res
      if (initial?._id) res = await api.put(`/workouts/${initial._id}`, form)
      else res = await api.post(`/patients/${patientId}/workouts`, form)
      toast.show('Treino salvo com sucesso!', 'success')
      onSaved(res.workout)
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="grid-2">
        <div className="field">
          <label>Título</label>
          <input className="input" value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </div>
        <div className="field">
          <label>Objetivo</label>
          <select className="select" value={form.objective} onChange={(e) => setField('objective', e.target.value)}>
            <option>Hipertrofia</option>
            <option>Emagrecimento</option>
            <option>Condicionamento</option>
            <option>Força</option>
            <option>Saúde geral</option>
          </select>
        </div>
      </div>
      <div className="grid-3" style={{ marginTop: 12 }}>
        <div className="field">
          <label>Nível</label>
          <select className="select" value={form.level} onChange={(e) => setField('level', e.target.value)}>
            <option>Iniciante</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </div>
        <div className="field">
          <label>Início</label>
          <input type="date" className="input" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
        </div>
        <div className="field">
          <label>Término (opcional)</label>
          <input type="date" className="input" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} />
        </div>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>Observações</label>
        <textarea className="textarea" value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: '1.05rem' }}>Dias de treino</h3>
          <button className="btn btn-secondary btn-sm" onClick={addDay}>
            <Plus size={14} /> Adicionar dia
          </button>
        </div>
        {form.days.map((day, di) => (
          <div key={di} className="card" style={{ marginBottom: 12, background: 'var(--surface-2)' }}>
            <div className="grid-2">
              <div className="field">
                <label>Identificação (ex: Treino A)</label>
                <input className="input" value={day.label} onChange={(e) => updateDay(di, { label: e.target.value })} />
              </div>
              <div className="field">
                <label>Foco muscular</label>
                <input className="input" value={day.focus} onChange={(e) => updateDay(di, { focus: e.target.value })} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Observações do dia</label>
              <input className="input" value={day.notes || ''} onChange={(e) => updateDay(di, { notes: e.target.value })} />
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Exercícios</span>
                <button className="btn btn-ghost btn-sm" onClick={() => addEx(di)}>
                  <Plus size={14} /> Exercício
                </button>
              </div>
              {day.exercises.map((ex, ei) => (
                <div key={ei} className="grid-3" style={{ gap: 6, marginBottom: 8, alignItems: 'end' }}>
                  <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Exercício</label>
                    <input className="input" value={ex.name} onChange={(e) => updateEx(di, ei, { name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Séries</label>
                    <input type="number" className="input" value={ex.sets} onChange={(e) => updateEx(di, ei, { sets: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Reps</label>
                    <input className="input" value={ex.reps} onChange={(e) => updateEx(di, ei, { reps: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Carga</label>
                    <input className="input" placeholder="20kg" value={ex.load} onChange={(e) => updateEx(di, ei, { load: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Descanso</label>
                    <input className="input" value={ex.rest} onChange={(e) => updateEx(di, ei, { rest: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Obs</label>
                    <input className="input" value={ex.notes || ''} onChange={(e) => updateEx(di, ei, { notes: e.target.value })} />
                  </div>
                  <div style={{ paddingBottom: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeEx(di, ei)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => removeDay(di)}>
                <Trash2 size={14} /> Remover dia
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar treino'}
        </button>
      </div>
    </div>
  )
}