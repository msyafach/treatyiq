import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="tiq-app">
      {/* 4px tri-color brand stripe at top of content */}
      <div className="tiq-brand-bar">
        <span style={{ background: '#757574' }} />
        <span style={{ background: '#13A538' }} />
        <span style={{ background: '#0095D6' }} />
      </div>

      <Sidebar />

      <div className="tiq-app-main">
        <TopBar onLogout={logout} />
        <main className="tiq-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
