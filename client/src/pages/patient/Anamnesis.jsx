import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import AnamnesisForm from '../../components/AnamnesisForm.jsx'

export default function Anamnesis() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/my/anamnesis').then((d) => setData(d.anamnesis)).catch((e) => toast.show(e.message, 'error')).finally(() => setLoading(false))
  }, [])

  const save = async (form) => {
    setSaving(true)
    try {
      const d = await api.put('/my/anamnesis', form)
      setData(d.anamnesis)
      toast.show('Anamnese salva.', 'success')
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="screen-loader"><div className="spinner" /></div>
  return (
    <div>
      <h1 style={{ marginBottom: 18 }}>Minha anamnese</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>Preencha seus dados clínicos e hábitos. A nutricionista terá acesso.</p>
      <div className="card">
        <AnamnesisForm initial={data} onSave={save} saving={saving} />
      </div>
    </div>
  )
}