import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icons } from './icons'
import Avatar from './Avatar'

const NAV_ITEMS = [
  { to: '/dashboard',      icon: Icons.dashboard,    label: 'Dashboard' },
  { to: '/submissions/new', icon: Icons.plus,        label: 'Ajukan Permohonan' },
  { to: '/approval-queue', icon: Icons.checkCircle,  label: 'Antrean Persetujuan', roles: ['company_tax_team'] },
  { to: '/documents',      icon: Icons.folder,       label: 'Brankas Dokumen' },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="tiq-side">
      {/* Brand */}
      <div className="tiq-brand-v tiq-brand-stripe" style={{ paddingTop: 26 }}>
        <div className="tiq-brand-stripe-bar">
          <span style={{ background: 'rgba(255,255,255,.7)' }} />
          <span style={{ background: '#55B249' }} />
          <span style={{ background: 'rgba(255,255,255,.9)' }} />
        </div>
        <div className="tiq-brand-product">TreatyIQ</div>
        <div className="tiq-brand-byline-tight">An RSM product · Portal P3B</div>
      </div>

      {/* Nav */}
      <nav className="tiq-side-nav">
        {NAV_ITEMS.map(({ to, icon, label, roles }) => {
          if (roles && !roles.includes(user?.role)) return null
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `tiq-side-link${isActive ? ' is-active' : ''}`
              }
            >
              <span className="tiq-side-icon">{icon}</span>
              <span className="tiq-side-label">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="tiq-side-footer">
        <div className="tiq-side-user">
          <Avatar name={user?.full_name} role={user?.role} size={36} />
          <div className="tiq-side-user-info">
            <div className="tiq-side-user-name">{user?.full_name}</div>
            <div className="tiq-side-user-role">
              {user?.role === 'company_tax_team' ? 'Tim Pajak Internal' : 'Vendor'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
