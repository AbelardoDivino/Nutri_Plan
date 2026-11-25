import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { CheckCircle2, Dumbbell } from 'lucide-react'

export default function Workout() {
  const toast = useToast()
  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [log, setLog] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    api.get('/my/workout').then((d) => setWorkout(d.workout)).catch((e) => toast.show(e.message, 'error')).finally(() => setLoading(false))
    api.get(`/my/today?date=${date}`).then((d) => setLog(d.log)).catch(() => {})
  }, [])

  const reloadLog = async (d) => {
    try {
      const r = await api.get(`/my/today?date=${d}`)
      setLog(r.log)
    } catch {}
  }

  const toggle = async (exId) => {
    try {
      const r = await api.post(`/my/today/exercise/${exId}/toggle`, { date })
      setLog(r.log)
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  useEffect(() => { reloadLog(date) }, [date])

  if (loading) return <div className="screen-loader"><div className="spinner" /></div>
  if (!workout) return (
    <div className="card empty">
      <Dumbbell size={40} className="icon" />
      <h3>Sem treino ativo</h3>
      <p>Sua nutricionista ainda não vinculou um programa de treino.</p>
    </div>
  )

  const exDone = (log?.exercisesDone || []).map(String)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>{workout.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{workout.objective} · {workout.level}</p>
        </div>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 160 }} />
      </div>

      {workout.notes && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--info-soft)' }}>
          <div style={{ fontSize: '0.88rem' }}><strong>Observações:</strong> {workout.notes}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {workout.days.map((day) => (
          <div key={day._id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{day.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{day.focus}</div>
              </div>
              <span className="badge badge-blue">{day.exercises.length} exercícios</span>
            </div>
            {day.notes && <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: 8 }}>{day.notes}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {day.exercises.map((ex) => {
                const done = exDone.includes(String(ex._id))
                return (
                  <div key={ex._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: done ? 'var(--primary-softer)' : 'var(--surface-2)' }}>
                    <button onClick={() => toggle(ex._id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: done ? 'var(--primary)' : 'var(--text-soft)' }}>
                      <CheckCircle2 size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-soft)' : 'var(--text)' }}>{ex.name}</div>
                      {ex.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{ex.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span><strong>{ex.sets}</strong>x{ex.reps}</span>
                      {ex.load && <span>{ex.load}</span>}
                      {ex.rest && <span>desc. {ex.rest}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}