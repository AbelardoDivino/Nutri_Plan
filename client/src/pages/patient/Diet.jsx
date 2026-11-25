import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { CheckCircle2, Salad } from 'lucide-react'

export default function Diet() {
  const toast = useToast()
  const [diet, setDiet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/my/diet').then((d) => setDiet(d.diet)).catch((e) => toast.show(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="screen-loader"><div className="spinner" /></div>
  if (!diet) return (
    <div className="card empty">
      <Salad size={40} className="icon" />
      <h3>Sem dieta ativa</h3>
      <p>Sua nutricionista ainda não vinculou um plano alimentar.</p>
    </div>
  )

  return (
    <div>
      <h1 style={{ marginBottom: 4 }}>{diet.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>{diet.objective} · {diet.totals?.calories} kcal/dia</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Metas diárias</div></div>
        <div className="grid-3">
          <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calorias</div><div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{diet.totals?.calories} / {diet.targetCalories} kcal</div></div>
          <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Proteína</div><div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{diet.totals?.protein} / {diet.targetProtein} g</div></div>
          <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Carboidrato</div><div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{diet.totals?.carbs} / {diet.targetCarbs} g</div></div>
          <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gordura</div><div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{diet.totals?.fat} / {diet.targetFat} g</div></div>
          <div><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Água</div><div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{diet.targetWater} ml</div></div>
        </div>
      </div>

      {diet.notes && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--primary-softer)' }}>
          <div style={{ fontSize: '0.88rem' }}><strong>Observações:</strong> {diet.notes}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {diet.meals.map((m) => (
          <div key={m._id} className="meal-card">
            <div className="meal-head">
              <div>
                <div className="name">{m.name}</div>
                <div className="time">{m.time} · {Math.round(m.foods.reduce((a, f) => a + (f.calories || 0), 0))} kcal</div>
              </div>
            </div>
            {m.foods.map((f, i) => (
              <div key={i} className="food-row">
                <span>{f.name}</span>
                <span style={{ color: 'var(--text-soft)' }}>{f.quantity} {f.unit} · {f.calories} kcal · P{f.protein} C{f.carbs} G{f.fat}</span>
              </div>
            ))}
            {m.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: 6 }}>{m.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}