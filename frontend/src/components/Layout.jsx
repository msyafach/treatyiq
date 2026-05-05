import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Portal Kepatuhan PMK 112/2025
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-danger transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Keluar</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
