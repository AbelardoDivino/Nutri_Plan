import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../lib/api.js'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({})
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [delPwd, setDelPwd] = useState('')
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        goal: user.goal || '',
        height: user.height || '',
        birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
        gender: user.gender || '',
        activityLevel: user.activityLevel || '',
        notes: user.notes || '',
      })
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      const data = await api.put('/auth/profile', form)
      updateUser(data.user)
      toast.show('Perfil atualizado.', 'success')
    } catch (err) {
      toast.show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const changePwd = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) {
      toast.show('Preencha as senhas.', 'error')
      return
    }
    try {
      await api.put('/auth/password', pwd)
      setPwd({ currentPassword: '', newPassword: '' })
      toast.show('Senha alterada.', 'success')
    } catch (err) {
      toast.show(err.message, 'error')
    }
  }

  if (!user) return null
  const isPatient = user.role === 'patient'

  return (
    <div>
      <h1 style={{ marginBottom: 18 }}>Meu perfil</h1>
      <div className="card">
        <div className="grid-2">
          <div className="field">
            <label>Nome</label>
            <input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Objetivo</label>
            <input className="input" value={form.goal || ''} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          </div>
          {isPatient && (
            <>
              <div className="field">
                <label>Data de nascimento</label>
                <input type="date" className="input" value={form.birthDate || ''} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
              </div>
              <div className="field">
                <label>Gênero</label>
                <select className="select" value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="field">
                <label>Altura (cm)</label>
                <input type="number" className="input" value={form.height || ''} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              </div>
              <div className="field">
                <label>Nível de atividade</label>
                <select className="select" value={form.activityLevel || ''} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
                  <option value="">Selecione</option>
                  <option>Sedentário</option>
                  <option>Leve</option>
                  <option>Moderado</option>
                  <option>Intenso</option>
                </select>
              </div>
            </>
          )}
        </div>
        {isPatient && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Observações</label>
            <textarea className="textarea" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 12 }}>Alterar senha</h3>
        <div className="grid-2">
          <div className="field">
            <label>Senha atual</label>
            <input type="password" className="input" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
          </div>
          <div className="field">
            <label>Nova senha</label>
            <input type="password" className="input" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={changePwd}>Alterar senha</button>
        </div>
      </div>

      {isPatient && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Seus dados (LGPD)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 12 }}>
            Você pode exportar todos os seus dados ou solicitar a exclusão da sua conta.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              disabled={exporting}
              onClick={async () => {
                setExporting(true)
                try {
                  const data = await api.get('/my/export')
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'meus-dados-nutriplan.json'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.show('Dados exportados.', 'success')
                } catch (err) {
                  toast.show(err.message, 'error')
                } finally {
                  setExporting(false)
                }
              }}
            >
              {exporting ? 'Exportando...' : 'Exportar meus dados'}
            </button>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>Excluir conta</div>
            <div className="field">
              <label>Confirme sua senha</label>
              <input type="password" className="input" value={delPwd} onChange={(e) => setDelPwd(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={async () => {
                  if (!delPwd) { toast.show('Informe sua senha.', 'error'); return }
                  if (!confirm('Tem certeza? Esta ação é irreversível.')) return
                  try {
                    await api.delete('/my/account', { password: delPwd })
                    toast.show('Conta excluída.', 'success')
                    // logout
                    localStorage.removeItem('nutri_token')
                    window.location.href = '/'
                  } catch (err) {
                    toast.show(err.message, 'error')
                  }
                }}
              >
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}