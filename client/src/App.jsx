import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import Landing from './pages/Landing.jsx'
import Privacy from './pages/Privacy.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Profile from './pages/Profile.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import PatientLayout from './components/PatientLayout.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminPatients from './pages/admin/Patients.jsx'
import AdminPatientDetail from './pages/admin/PatientDetail.jsx'
import AdminLeads from './pages/admin/Leads.jsx'
import AdminMessages from './pages/admin/Messages.jsx'
import PatientHome from './pages/patient/Home.jsx'
import PatientDiet from './pages/patient/Diet.jsx'
import PatientWorkout from './pages/patient/Workout.jsx'
import PatientProgress from './pages/patient/Progress.jsx'
import PatientAnamnesis from './pages/patient/Anamnesis.jsx'
import PatientMessages from './pages/patient/Messages.jsx'

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-loader"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="patients/:id" element={<AdminPatientDetail />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route
            path="/app"
            element={
              <RequireAuth role="patient">
                <PatientLayout />
              </RequireAuth>
            }
          >
            <Route index element={<PatientHome />} />
            <Route path="diet" element={<PatientDiet />} />
            <Route path="workout" element={<PatientWorkout />} />
            <Route path="progress" element={<PatientProgress />} />
            <Route path="anamnesis" element={<PatientAnamnesis />} />
            <Route path="messages" element={<PatientMessages />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}