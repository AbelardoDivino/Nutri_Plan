import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { CheckCircle2, Droplets, Flame, Dumbbell, TrendingUp, ChevronRight, Salad } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [log, setLog] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const load = async () => {
    try {
      const d = await api.get(`/my/today?date=${date}`)
      setData(d)
      setLog(d.log)
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  useEffect(() => { load() }, [date])

  if (!data) return <div className="screen-loader"><div className="spinner" /></div>

  const { diet, workout } = data
  const toggleMeal = async (mealId) => {
    try {
      const r = await api.post(`/my/today/meal/${mealId}/toggle`, { date })
      setLog(r.log)
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }
  const toggleExercise = async (exId) => {
    try {
      const r = await api.post(`/my/today/exercise/${exId}/toggle`, { date })
      setLog(r.log)
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }
  const addWater = async (amount) => {
    try {
      const r = await api.post('/my/today/water', { amount, date })
      setLog(r.log)
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const mealsDone = (log?.mealsDone || []).map(String)
  const exDone = (log?.exercisesDone || []).map(String)
  const totalKcal = diet?.totals?.calories || 0
  const targetKcal = diet?.targetCalories || 0
  const water = log?.water || 0
  const waterTarget = diet?.targetWater || 2000
  const waterGlasses = Math.round(water / 250)
  const waterTargetGlasses = Math.round(waterTarget / 250)

  const todayWorkoutDay = workout?.days?.length ? workout.days[new Date(date).getDay() % workout.days.length] : null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1>Hoje</h1>
          <p style={{ color: 'var(--text-muted)' }}>{new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
        </div>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 160 }} />
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card green">
          <div className="icon"><Flame size={20} /></div>
          <div className="label">Calorias</div>
          <div className="value">{totalKcal}</div>
          <div className="hint">meta {targetKcal} kcal</div>
        </div>
        <div className="stat-card blue">
          <div className="icon"><Droplets size={20} /></div>
          <div className="label">Água</div>
          <div className="value">{(water / 1000).toFixed(2)}L</div>
          <div className="hint">meta {(waterTarget / 1000).toFixed(1)}L</div>
        </div>
        <div className="stat-card amber">
          <div className="icon"><CheckCircle2 size={20} /></div>
          <div className="label">Refeições feitas</div>
          <div className="value">{mealsDone.length}/{diet?.meals?.length || 0}</div>
          <div className="hint">do plano do dia</div>
        </div>
        <div className="stat-card red">
          <div className="icon"><Dumbbell size={20} /></div>
          <div className="label">Exercícios feitos</div>
          <div className="value">{exDone.length}</div>
          <div className="hint">hoje</div>
        </div>
      </div>

      {diet ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div>
              <div className="card-title">{diet.title}</div>
              <div className="card-sub">{diet.objective} · {diet.totals?.calories} kcal totais</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/diet')}>
              Ver dieta <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {diet.meals.map((m) => {
              const done = mealsDone.includes(String(m._id))
              return (
                <div key={m._id} className={`meal-card ${done ? 'done' : ''}`}>
                  <div className="meal-head">
                    <button
                      onClick={() => toggleMeal(m._id)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: done ? 'var(--primary)' : 'var(--text-soft)' }}
                    >
                      <CheckCircle2 size={22} />
                    </button>
                    <div>
                      <div className="name">{m.name}</div>
                      <div className="time">{m.time} · {Math.round(m.foods.reduce((a, f) => a + (f.calories || (f.protein * 4 + f.carbs * 4 + f.fat * 9)), 0))} kcal</div>
                    </div>
                  </div>
                  {m.foods.map((f, i) => (
                    <div key={i} className="food-row">
                      <span>{f.name}</span>
                      <span style={{ color: 'var(--text-soft)' }}>{f.quantity} {f.unit}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card empty" style={{ marginBottom: 16 }}>
          <SaladIcon />
          <h3>Sem dieta ativa</h3>
          <p>Sua nutricionista ainda não vinculou um plano alimentar.</p>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Água</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{water} / {waterTarget} ml</div>
          </div>
          <div className="progress" style={{ marginBottom: 10 }}>
            <div style={{ width: `${Math.min(100, (water / waterTarget) * 100)}%` }} />
          </div>
          <div className="water-glasses">
            {Array.from({ length: waterTargetGlasses }).map((_, i) => (
              <div key={i} className={`glass ${i < waterGlasses ? 'filled' : ''}`} onClick={() => {}} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => addWater(250)}>+ 250 ml</button>
            <button className="btn btn-secondary btn-sm" onClick={() => addWater(-250)}>- 250 ml</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Treino de hoje</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/workout')}>
              Ver treino <ChevronRight size={14} />
            </button>
          </div>
          {workout ? (
            <div>
              {todayWorkoutDay && (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{todayWorkoutDay.label} — {todayWorkoutDay.focus}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {todayWorkoutDay.exercises.map((ex) => {
                      const done = exDone.includes(String(ex._id))
                      return (
                        <div key={ex._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                          <button onClick={() => toggleExercise(ex._id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: done ? 'var(--primary)' : 'var(--text-soft)' }}>
                            <CheckCircle2 size={18} />
                          </button>
                          <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-soft)' : 'var(--text)' }}>{ex.name}</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--text-soft)', fontSize: '0.78rem' }}>{ex.sets}x{ex.reps}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Sem treino ativo.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SaladIcon() {
  return <Salad size={40} className="icon" />
}