import { useState } from 'react'
import { api } from '../lib/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { Plus, Trash2, Search } from 'lucide-react'

const UNITS = ['g', 'ml', 'un', 'fatia', 'colher', 'xícara', 'porção']

const emptyFood = () => ({ name: '', quantity: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0, basePer100: null })
const emptyMeal = () => ({ name: 'Nova refeição', time: '', notes: '', foods: [emptyFood()] })

const calcFoodCal = (f) => (f.calories > 0 ? f.calories : (f.protein || 0) * 4 + (f.carbs || 0) * 4 + (f.fat || 0) * 9)

export default function DietEditor({ patientId, initial, onSaved, onCancel }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: initial?.title || 'Novo plano alimentar',
    objective: initial?.objective || 'Emagrecimento',
    notes: initial?.notes || '',
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '',
    targetCalories: initial?.targetCalories || 0,
    targetProtein: initial?.targetProtein || 0,
    targetCarbs: initial?.targetCarbs || 0,
    targetFat: initial?.targetFat || 0,
    targetWater: initial?.targetWater || 2000,
    active: initial?.active !== false,
    meals: initial?.meals?.length ? initial.meals : [emptyMeal()],
  })
  const [saving, setSaving] = useState(false)
  const [foodSearch, setFoodSearch] = useState({ mi: null, q: '', results: [], loading: false })

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const updateMeal = (mi, patch) => {
    setForm((f) => {
      const meals = [...f.meals]
      meals[mi] = { ...meals[mi], ...patch }
      return { ...f, meals }
    })
  }
  const removeMeal = (mi) => setForm((f) => ({ ...f, meals: f.meals.filter((_, i) => i !== mi) }))
  const addMeal = () => setForm((f) => ({ ...f, meals: [...f.meals, emptyMeal()] }))

  const updateFood = (mi, fi, patch) => {
    setForm((f) => {
      const meals = [...f.meals]
      const foods = [...meals[mi].foods]
      let food = { ...foods[fi], ...patch }
      // auto-scale macros when quantity changes and we have per-100g base
      if (patch.quantity !== undefined && food.basePer100 && (food.unit === 'g' || food.unit === 'ml')) {
        const factor = (Number(food.quantity) || 0) / 100
        food.calories = Math.round(food.basePer100.calories * factor)
        food.protein = Math.round(food.basePer100.protein * factor * 10) / 10
        food.carbs = Math.round(food.basePer100.carbs * factor * 10) / 10
        food.fat = Math.round(food.basePer100.fat * factor * 10) / 10
      }
      // clear base if user manually edits macros/calories
      if (patch.calories !== undefined || patch.protein !== undefined || patch.carbs !== undefined || patch.fat !== undefined) {
        if (patch.quantity === undefined) food.basePer100 = null
      }
      foods[fi] = food
      meals[mi] = { ...meals[mi], foods }
      return { ...f, meals }
    })
  }
  const searchFood = async (mi, q) => {
    setFoodSearch({ mi, q, results: [], loading: true })
    if (!q || q.trim().length < 2) {
      setFoodSearch({ mi, q, results: [], loading: false })
      return
    }
    try {
      const res = await fetch(`https://calortracker.com/api/v1/foods?q=${encodeURIComponent(q.trim())}&limit=8`)
      const json = await res.json()
      setFoodSearch({ mi, q, results: json.data || [], loading: false })
    } catch (err) {
      setFoodSearch({ mi, q, results: [], loading: false })
    }
  }

  const selectFood = (mi, item) => {
    const base = {
      calories: item.per100g?.energyKcal || 0,
      protein: item.per100g?.proteinG || 0,
      carbs: item.per100g?.carbsG || 0,
      fat: item.per100g?.fatG || 0,
    }
    setForm((f) => {
      const meals = [...f.meals]
      meals[mi] = { ...meals[mi], foods: [...meals[mi].foods, { name: item.name, quantity: 100, unit: 'g', calories: base.calories, protein: base.protein, carbs: base.carbs, fat: base.fat, basePer100: base }] }
      return { ...f, meals }
    })
    setFoodSearch({ mi: null, q: '', results: [], loading: false })
  }

  const removeFood = (mi, fi) =>
    setForm((f) => {
      const meals = [...f.meals]
      meals[mi] = { ...meals[mi], foods: meals[mi].foods.filter((_, i) => i !== fi) }
      return { ...f, meals }
    })
  const addFood = (mi) =>
    setForm((f) => {
      const meals = [...f.meals]
      meals[mi] = { ...meals[mi], foods: [...meals[mi].foods, emptyFood()] }
      return { ...f, meals }
    })

  const totals = form.meals.reduce(
    (acc, m) => {
      for (const f of m.foods) {
        acc.calories += calcFoodCal(f)
        acc.protein += Number(f.protein) || 0
        acc.carbs += Number(f.carbs) || 0
        acc.fat += Number(f.fat) || 0
      }
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const save = async () => {
    if (!form.title.trim()) {
      toast.show('Informe o título da dieta.', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        meals: form.meals.map((m) => ({
          ...m,
          foods: m.foods.map((f) => ({ ...f, calories: calcFoodCal(f) })),
        })),
      }
      let res
      if (initial?._id) {
        res = await api.put(`/diets/${initial._id}`, payload)
      } else {
        res = await api.post(`/patients/${patientId}/diets`, payload)
      }
      toast.show('Dieta salva com sucesso!', 'success')
      onSaved(res.diet)
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
            <option>Emagrecimento</option>
            <option>Hipertrofia</option>
            <option>Manutenção</option>
            <option>Saúde geral</option>
            <option>Performance</option>
          </select>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 12 }}>
        <div className="field">
          <label>Início</label>
          <input type="date" className="input" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
        </div>
        <div className="field">
          <label>Término (opcional)</label>
          <input type="date" className="input" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--surface-2)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Metas diárias</div>
            <div className="card-sub">Calorias e macros alvo</div>
          </div>
        </div>
        <div className="grid-3">
          <div className="field">
            <label>Calorias (kcal)</label>
            <input type="number" className="input" value={form.targetCalories} onChange={(e) => setField('targetCalories', e.target.value)} />
          </div>
          <div className="field">
            <label>Proteína (g)</label>
            <input type="number" className="input" value={form.targetProtein} onChange={(e) => setField('targetProtein', e.target.value)} />
          </div>
          <div className="field">
            <label>Carboidrato (g)</label>
            <input type="number" className="input" value={form.targetCarbs} onChange={(e) => setField('targetCarbs', e.target.value)} />
          </div>
          <div className="field">
            <label>Gordura (g)</label>
            <input type="number" className="input" value={form.targetFat} onChange={(e) => setField('targetFat', e.target.value)} />
          </div>
          <div className="field">
            <label>Água (ml)</label>
            <input type="number" className="input" value={form.targetWater} onChange={(e) => setField('targetWater', e.target.value)} />
          </div>
          <div className="field">
            <label>Ativa</label>
            <select className="select" value={form.active ? 'sim' : 'nao'} onChange={(e) => setField('active', e.target.value === 'sim')}>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Observações</label>
        <textarea className="textarea" value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: '1.05rem' }}>Refeições</h3>
          <button className="btn btn-secondary btn-sm" onClick={addMeal}>
            <Plus size={14} /> Adicionar refeição
          </button>
        </div>
        {form.meals.map((meal, mi) => (
          <div key={mi} className="card" style={{ marginBottom: 12, background: 'var(--surface-2)' }}>
            <div className="grid-2">
              <div className="field">
                <label>Nome da refeição</label>
                <input className="input" value={meal.name} onChange={(e) => updateMeal(mi, { name: e.target.value })} />
              </div>
              <div className="field">
                <label>Horário</label>
                <input className="input" placeholder="07:00" value={meal.time} onChange={(e) => updateMeal(mi, { time: e.target.value })} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label>Observações</label>
              <input className="input" value={meal.notes || ''} onChange={(e) => updateMeal(mi, { notes: e.target.value })} />
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-soft)' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 32 }}
                    placeholder="Buscar alimento (CalorTracker)..."
                    value={foodSearch.mi === mi ? foodSearch.q : ''}
                    onChange={(e) => searchFood(mi, e.target.value)}
                  />
                </div>
              </div>
              {foodSearch.mi === mi && (foodSearch.loading || foodSearch.results.length > 0) && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', marginBottom: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {foodSearch.loading && <div style={{ padding: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Buscando...</div>}
                  {foodSearch.results.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => selectFood(mi, item)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)' }}
                    >
                      <strong>{item.name}</strong>
                      <span style={{ color: 'var(--text-soft)', marginLeft: 8 }}>
                        {item.per100g?.energyKcal} kcal · P{item.per100g?.proteinG} C{item.per100g?.carbsG} G{item.per100g?.fatG} (por 100g)
                      </span>
                    </button>
                  ))}
                  {foodSearch.results.length === 0 && !foodSearch.loading && foodSearch.q.length >= 2 && (
                    <div style={{ padding: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhum resultado.</div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Alimentos</span>
                <button className="btn btn-ghost btn-sm" onClick={() => addFood(mi)}>
                  <Plus size={14} /> Alimento
                </button>
              </div>
              {meal.foods.map((food, fi) => (
                <div key={fi} className="grid-3" style={{ gap: 6, marginBottom: 6, alignItems: 'end' }}>
                  <div className="field">
                    <label>Nome</label>
                    <input className="input" value={food.name} onChange={(e) => updateFood(mi, fi, { name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Qtd</label>
                    <input type="number" className="input" value={food.quantity} onChange={(e) => updateFood(mi, fi, { quantity: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Unidade</label>
                    <select className="select" value={food.unit} onChange={(e) => updateFood(mi, fi, { unit: e.target.value })}>
                      {UNITS.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Kcal</label>
                    <input type="number" className="input" value={food.calories} onChange={(e) => updateFood(mi, fi, { calories: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>P (g)</label>
                    <input type="number" className="input" value={food.protein} onChange={(e) => updateFood(mi, fi, { protein: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>C (g)</label>
                    <input type="number" className="input" value={food.carbs} onChange={(e) => updateFood(mi, fi, { carbs: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>G (g)</label>
                    <input type="number" className="input" value={food.fat} onChange={(e) => updateFood(mi, fi, { fat: e.target.value })} />
                  </div>
                  <div style={{ paddingBottom: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeFood(mi, fi)} title="Remover">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: 4 }}>
                Subtotal: {Math.round(meal.foods.reduce((a, f) => a + calcFoodCal(f), 0))} kcal
              </div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => removeMeal(mi)}>
                <Trash2 size={14} /> Remover refeição
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12, background: 'var(--primary-softer)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Total do dia</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {Math.round(totals.calories)} kcal · P {Math.round(totals.protein * 10) / 10}g · C {Math.round(totals.carbs * 10) / 10}g · G {Math.round(totals.fat * 10) / 10}g
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Meta: {form.targetCalories} kcal
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 12, textAlign: 'center' }}>
        Dados nutricionais: USDA FoodData Central via CalorTracker (CC0).
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar dieta'}
        </button>
      </div>
    </div>
  )
}