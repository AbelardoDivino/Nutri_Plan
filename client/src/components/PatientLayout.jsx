import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { useEffect, useState } from 'react'
import { Home, Salad, Dumbbell, TrendingUp, MessageSquare, User, LogOut, ClipboardList } from 'lucide-react'

export default function PatientLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const u = await api.get('/messages/unread-count')
        if (mounted) setUnread(u.count)
      } catch {}
    }
    load()
    const t = setInterval(load, 15000)
    return () => {
      mounted = false
      clearInterval(t)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const initial = (user?.name || 'P').slice(0, 1).toUpperCase()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">N</div>
          NutriPlan
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/app" end className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Home size={18} /> Hoje
          </NavLink>
          <NavLink to="/app/diet" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Salad size={18} /> Minha dieta
          </NavLink>
          <NavLink to="/app/workout" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Dumbbell size={18} /> Meu treino
          </NavLink>
          <NavLink to="/app/progress" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <TrendingUp size={18} /> Evolução
          </NavLink>
          <NavLink to="/app/anamnesis" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <ClipboardList size={18} /> Anamnese
          </NavLink>
          <NavLink to="/app/messages" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <MessageSquare size={18} /> Mensagens
            {unread > 0 && <span className="badge">{unread}</span>}
          </NavLink>
          <NavLink to="/app/profile" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <User size={18} /> Perfil
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initial}</div>
            <div className="meta">
              <div className="name">{user?.name}</div>
              <div className="role">Paciente</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="title">Olá, {user?.name?.split(' ')[0]}</div>
          <div className="actions">
            <span className="badge badge-blue">Paciente</span>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}