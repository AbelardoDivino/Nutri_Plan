import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { api } from '../lib/api.js'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, MessageSquare, Inbox, User, LogOut, Salad, Dumbbell } from 'lucide-react'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [leadsNew, setLeadsNew] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const u = await api.get('/messages/unread-count')
        if (mounted) setUnread(u.count)
        const l = await api.get('/leads')
        if (mounted) setLeadsNew(l.leads.filter((x) => x.status === 'novo').length)
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

  const initial = (user?.name || 'N').slice(0, 1).toUpperCase()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">N</div>
          NutriPlan
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/patients" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Users size={18} /> Pacientes
          </NavLink>
          <NavLink to="/admin/leads" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <Inbox size={18} /> Contatos
            {leadsNew > 0 && <span className="badge">{leadsNew}</span>}
          </NavLink>
          <NavLink to="/admin/messages" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <MessageSquare size={18} /> Mensagens
            {unread > 0 && <span className="badge">{unread}</span>}
          </NavLink>
          <NavLink to="/admin/profile" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <User size={18} /> Perfil
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initial}</div>
            <div className="meta">
              <div className="name">{user?.name}</div>
              <div className="role">Nutricionista</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="title">Área do nutricionista</div>
          <div className="actions">
            <span className="badge badge-green">Admin</span>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}