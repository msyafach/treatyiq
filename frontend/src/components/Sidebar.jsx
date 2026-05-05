import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, ClipboardCheck, FolderOpen, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/submissions/new', icon: PlusCircle, label: 'Ajukan Permohonan' },
  { to: '/approval-queue', icon: ClipboardCheck, label: 'Antrean Persetujuan', roles: ['company_tax_team'] },
  { to: '/documents', icon: FolderOpen, label: 'Brankas Dokumen' },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{ backgroundColor: '#0095D6' }}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-lg p-1.5">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">TreatyIQ</div>
            <div className="text-white/70 text-[10px] leading-tight">Portal Pajak P3B</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, roles }) => {
          if (roles && !roles.includes(user?.role)) return null
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/15'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/20">
        <div className="text-white/80 text-xs truncate">{user?.full_name}</div>
        <div className="text-white/50 text-[11px] truncate">{user?.company_name}</div>
        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">
          {user?.role === 'company_tax_team' ? 'Tim Pajak' : 'Vendor'}
        </span>
      </div>
    </aside>
  )
}
