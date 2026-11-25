import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import Modal from '../../components/Modal.jsx'
import DietEditor from '../../components/DietEditor.jsx'
import WorkoutEditor from '../../components/WorkoutEditor.jsx'
import Chat from '../../components/Chat.jsx'
import LineChart from '../../components/LineChart.jsx'
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, User, Activity, Salad, Dumbbell, TrendingUp, MessageSquare, ClipboardList } from 'lucide-react'
import AnamnesisForm from '../../components/AnamnesisForm.jsx'

const TABS = [
  { id: 'overview', label: 'Resumo', icon: User },
  { id: 'diet', label: 'Dieta', icon: Salad },
  { id: 'workout', label: 'Treino', icon: Dumbbell },
  { id: 'progress', label: 'Evolução', icon: TrendingUp },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
  { id: 'anamnesis', label: 'Anamnese', icon: ClipboardList },
]

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [dietModal, setDietModal] = useState(null) // null | 'new' | diet object
  const [workoutModal, setWorkoutModal] = useState(null)
  const [progressForm, setProgressForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: '', bodyFat: '', waist: '', chest: '', hip: '', arm: '', notes: '' })
  const [anamnesis, setAnamnesis] = useState(null)
  const [savingAnamnesis, setSavingAnamnesis] = useState(false)
  const [editingPatient, setEditingPatient] = useState(false)
  const [pform, setPform] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const d = await api.get(`/patients/${id}`)
      setData(d)
      setPform(d.patient)
    } catch (err) {
      toast.show(err.message, 'error')
      navigate('/admin/patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    if (tab === 'anamnesis') {
      api.get(`/patients/${id}/anamnesis`).then((d) => setAnamnesis(d.anamnesis)).catch(() => {})
    }
  }, [tab, id])

  if (loading || !data) return <div className="screen-loader"><div className="spinner" /></div>

  const { patient, diets, workouts, progress } = data

  const savePatient = async () => {
    try {
      await api.put(`/patients/${id}`, pform)
      toast.show('Paciente atualizado.', 'success')
      setEditingPatient(false)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const deletePatient = async () => {
    if (!confirm('Excluir este paciente e todos os seus dados?')) return
    try {
      await api.delete(`/patients/${id}`)
      toast.show('Paciente excluído.', 'success')
      navigate('/admin/patients')
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const resetPwd = async () => {
    try {
      const r = await api.post(`/patients/${id}/reset-password`)
      toast.show(`Nova senha: ${r.tempPassword}`, 'success')
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const addProgress = async () => {
    try {
      await api.post(`/patients/${id}/progress`, progressForm)
      toast.show('Registro adicionado.', 'success')
      setProgressForm({ date: new Date().toISOString().slice(0, 10), weight: '', bodyFat: '', waist: '', chest: '', hip: '', arm: '', notes: '' })
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const deleteProgress = async (pid) => {
    if (!confirm('Excluir este registro?')) return
    try {
      await api.delete(`/progress/${pid}`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const activateDiet = async (dietId) => {
    try {
      await api.patch(`/diets/${dietId}/activate`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }
  const deleteDiet = async (dietId) => {
    if (!confirm('Excluir esta dieta?')) return
    try {
      await api.delete(`/diets/${dietId}`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }
  const activateWorkout = async (wId) => {
    try {
      await api.patch(`/workouts/${wId}/activate`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }
  const deleteWorkout = async (wId) => {
    if (!confirm('Excluir este treino?')) return
    try {
      await api.delete(`/workouts/${wId}`)
      load()
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  const initial = (patient.name || 'P').slice(0, 1).toUpperCase()

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/patients')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 60, height: 60, fontSize: '1.4rem' }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: '1.35rem' }}>{patient.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{patient.email} · {patient.phone || 'sem telefone'}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {patient.goal && <span className="badge badge-green">{patient.goal}</span>}
              {patient.height && <span className="badge badge-gray">{patient.height} cm</span>}
              {patient.startWeight && <span className="badge badge-gray">{patient.startWeight} kg inicial</span>}
              <span className={`badge ${patient.active ? 'badge-green' : 'badge-red'}`}>{patient.active ? 'Ativo' : 'Inativo'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingPatient(true)}>
              <Edit2 size={14} /> Editar
            </button>
            <button className="btn btn-secondary btn-sm" onClick={resetPwd}>Resetar senha</button>
            <button className="btn btn-danger btn-sm" onClick={deletePatient}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><div className="card-title">Dados do paciente</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
              <div><strong>Objetivo:</strong> {patient.goal || '—'}</div>
              <div><strong>Nascimento:</strong> {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '—'}</div>
              <div><strong>Gênero:</strong> {patient.gender || '—'}</div>
              <div><strong>Altura:</strong> {patient.height ? `${patient.height} cm` : '—'}</div>
              <div><strong>Peso inicial:</strong> {patient.startWeight ? `${patient.startWeight} kg` : '—'}</div>
              <div><strong>Atividade:</strong> {patient.activityLevel || '—'}</div>
              <div><strong>Cadastro:</strong> {new Date(patient.createdAt).toLocaleDateString('pt-BR')}</div>
              {patient.notes && <div><strong>Obs:</strong> {patient.notes}</div>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Planos ativos</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>Dieta</div>
                {diets.find((d) => d.active) ? (
                  <span className="badge badge-green">{diets.find((d) => d.active).title}</span>
                ) : (
                  <span className="badge badge-gray">Sem dieta ativa</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>Treino</div>
                {workouts.find((w) => w.active) ? (
                  <span className="badge badge-blue">{workouts.find((w) => w.active).title}</span>
                ) : (
                  <span className="badge badge-gray">Sem treino ativo</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>Evolução</div>
                {progress.length ? (
                  <span>{progress[0]?.weight ?? '—'} kg (último)</span>
                ) : (
                  <span className="badge badge-gray">Sem registros</span>
                )}
              </div>
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><div className="card-title">Evolução do peso</div></div>
            <LineChart data={[...progress].reverse()} valueKey="weight" label="Peso (kg)" />
          </div>
        </div>
      )}

      {tab === 'diet' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.05rem' }}>Planos alimentares</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setDietModal('new')}>
              <Plus size={14} /> Nova dieta
            </button>
          </div>
          {diets.length === 0 ? (
            <div className="card empty">
              <Salad size={40} className="icon" />
              <h3>Nenhuma dieta cadastrada</h3>
              <p>Crie o primeiro plano alimentar.</p>
            </div>
          ) : (
            diets.map((d) => (
              <div key={d._id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {d.title}
                      {d.active && <span className="badge badge-green">Ativa</span>}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {d.objective} · {d.totals?.calories || 0} kcal · {d.meals?.length || 0} refeições
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!d.active && <button className="btn btn-ghost btn-sm" onClick={() => activateDiet(d._id)}>Ativar</button>}
                    <button className="btn btn-secondary btn-sm" onClick={() => setDietModal(d)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteDiet(d._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'workout' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1.05rem' }}>Planos de treino</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setWorkoutModal('new')}>
              <Plus size={14} /> Novo treino
            </button>
          </div>
          {workouts.length === 0 ? (
            <div className="card empty">
              <Dumbbell size={40} className="icon" />
              <h3>Nenhum treino cadastrado</h3>
              <p>Crie o primeiro programa de treino.</p>
            </div>
          ) : (
            workouts.map((w) => (
              <div key={w._id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {w.title}
                      {w.active && <span className="badge badge-blue">Ativo</span>}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {w.objective} · {w.level} · {w.days?.length || 0} dias
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!w.active && <button className="btn btn-ghost btn-sm" onClick={() => activateWorkout(w._id)}>Ativar</button>}
                    <button className="btn btn-secondary btn-sm" onClick={() => setWorkoutModal(w)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteWorkout(w._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'progress' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Novo registro</div></div>
            <div className="grid-3">
              <div className="field"><label>Data</label><input type="date" className="input" value={progressForm.date} onChange={(e) => setProgressForm({ ...progressForm, date: e.target.value })} /></div>
              <div className="field"><label>Peso (kg)</label><input type="number" className="input" value={progressForm.weight} onChange={(e) => setProgressForm({ ...progressForm, weight: e.target.value })} /></div>
              <div className="field"><label>% Gordura</label><input type="number" className="input" value={progressForm.bodyFat} onChange={(e) => setProgressForm({ ...progressForm, bodyFat: e.target.value })} /></div>
              <div className="field"><label>Cintura (cm)</label><input type="number" className="input" value={progressForm.waist} onChange={(e) => setProgressForm({ ...progressForm, waist: e.target.value })} /></div>
              <div className="field"><label>Peito (cm)</label><input type="number" className="input" value={progressForm.chest} onChange={(e) => setProgressForm({ ...progressForm, chest: e.target.value })} /></div>
              <div className="field"><label>Quadril (cm)</label><input type="number" className="input" value={progressForm.hip} onChange={(e) => setProgressForm({ ...progressForm, hip: e.target.value })} /></div>
              <div className="field"><label>Braço (cm)</label><input type="number" className="input" value={progressForm.arm} onChange={(e) => setProgressForm({ ...progressForm, arm: e.target.value })} /></div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Observações</label>
              <input className="input" value={progressForm.notes} onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={addProgress}>Adicionar registro</button>
            </div>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Evolução do peso</div></div>
            <LineChart data={[...progress].reverse()} valueKey="weight" />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Data</th><th>Peso</th><th>% Gordura</th><th>Cintura</th><th>Peito</th><th>Quadril</th><th>Braço</th><th></th></tr>
              </thead>
              <tbody>
                {progress.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                    <td>{p.weight ?? '—'}</td>
                    <td>{p.bodyFat ?? '—'}</td>
                    <td>{p.waist ?? '—'}</td>
                    <td>{p.chest ?? '—'}</td>
                    <td>{p.hip ?? '—'}</td>
                    <td>{p.arm ?? '—'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteProgress(p._id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'anamnesis' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Anamnese nutricional</div></div>
          <AnamnesisForm
            initial={anamnesis}
            saving={savingAnamnesis}
            onSave={async (form) => {
              setSavingAnamnesis(true)
              try {
                const d = await api.put(`/patients/${id}/anamnesis`, form)
                setAnamnesis(d.anamnesis)
                toast.show('Anamnese salva.', 'success')
              } catch (err) {
                toast.show(err.message, 'error')
              } finally {
                setSavingAnamnesis(false)
              }
            }}
          />
        </div>
      )}

      {tab === 'messages' && (
        <div>
          <Chat patientId={id} title={`Conversa com ${patient.name}`} />
        </div>
      )}

      <Modal open={!!dietModal} onClose={() => setDietModal(null)} title={dietModal === 'new' ? 'Nova dieta' : 'Editar dieta'} size="lg">
        <DietEditor
          patientId={id}
          initial={dietModal === 'new' ? null : dietModal}
          onSaved={() => { setDietModal(null); load() }}
          onCancel={() => setDietModal(null)}
        />
      </Modal>
      <Modal open={!!workoutModal} onClose={() => setWorkoutModal(null)} title={workoutModal === 'new' ? 'Novo treino' : 'Editar treino'} size="lg">
        <WorkoutEditor
          patientId={id}
          initial={workoutModal === 'new' ? null : workoutModal}
          onSaved={() => { setWorkoutModal(null); load() }}
          onCancel={() => setWorkoutModal(null)}
        />
      </Modal>
      <Modal open={editingPatient} onClose={() => setEditingPatient(false)} title="Editar paciente">
        <div className="grid-2">
          <div className="field"><label>Nome</label><input className="input" value={pform.name || ''} onChange={(e) => setPform({ ...pform, name: e.target.value })} /></div>
          <div className="field"><label>E-mail</label><input className="input" value={pform.email || ''} onChange={(e) => setPform({ ...pform, email: e.target.value })} /></div>
          <div className="field"><label>Telefone</label><input className="input" value={pform.phone || ''} onChange={(e) => setPform({ ...pform, phone: e.target.value })} /></div>
          <div className="field"><label>Objetivo</label><input className="input" value={pform.goal || ''} onChange={(e) => setPform({ ...pform, goal: e.target.value })} /></div>
          <div className="field"><label>Altura (cm)</label><input type="number" className="input" value={pform.height || ''} onChange={(e) => setPform({ ...pform, height: e.target.value })} /></div>
          <div className="field"><label>Peso inicial (kg)</label><input type="number" className="input" value={pform.startWeight || ''} onChange={(e) => setPform({ ...pform, startWeight: e.target.value })} /></div>
          <div className="field"><label>Ativo</label>
            <select className="select" value={pform.active ? 'sim' : 'nao'} onChange={(e) => setPform({ ...pform, active: e.target.value === 'sim' })}>
              <option value="sim">Sim</option><option value="nao">Não</option>
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Observações</label>
          <textarea className="textarea" value={pform.notes || ''} onChange={(e) => setPform({ ...pform, notes: e.target.value })} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setEditingPatient(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={savePatient}>Salvar</button>
        </div>
      </Modal>
    </div>
  )
}