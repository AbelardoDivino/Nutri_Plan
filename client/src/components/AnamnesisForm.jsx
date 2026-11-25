import { useState, useEffect } from 'react'

const FIELDS = [
  { key: 'allergies', label: 'Alergias alimentares', placeholder: 'Ex: lactose, glúten, frutos do mar' },
  { key: 'diseases', label: 'Doenças / condições de saúde', placeholder: 'Ex: diabetes, hipertensão, hipotireoidismo' },
  { key: 'medications', label: 'Medicamentos em uso', placeholder: 'Ex: metformina, levotiroxina' },
  { key: 'dietaryRestrictions', label: 'Restrições alimentares', placeholder: 'Ex: vegetariano, sem lactose, low carb' },
  { key: 'eatingHabits', label: 'Hábitos alimentares', placeholder: 'Refeições por dia, horários, beliscar, etc.' },
  { key: 'physicalActivity', label: 'Atividade física', placeholder: 'Tipo, frequência, duração' },
  { key: 'sleep', label: 'Sono', placeholder: 'Horas por noite, qualidade' },
  { key: 'waterIntake', label: 'Ingestão de água', placeholder: 'Litros por dia' },
  { key: 'preferences', label: 'Preferências / aversões', placeholder: 'Alimentos que gosta ou não gosta' },
  { key: 'notes', label: 'Observações da nutricionista', placeholder: 'Notas adicionais' },
]

export default function AnamnesisForm({ initial, onSave, saving }) {
  const [form, setForm] = useState({})
  useEffect(() => {
    const base = {}
    FIELDS.forEach((f) => (base[f.key] = initial?.[f.key] || ''))
    setForm(base)
  }, [initial])

  return (
    <div>
      {FIELDS.map((f) => (
        <div className="field" key={f.key} style={{ marginBottom: 12 }}>
          <label>{f.label}</label>
          <textarea
            className="textarea"
            style={{ minHeight: 60 }}
            placeholder={f.placeholder}
            value={form[f.key] || ''}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        </div>
      ))}
      <div className="modal-actions">
        <button className="btn btn-primary" disabled={saving} onClick={() => onSave(form)}>
          {saving ? 'Salvando...' : 'Salvar anamnese'}
        </button>
      </div>
    </div>
  )
}