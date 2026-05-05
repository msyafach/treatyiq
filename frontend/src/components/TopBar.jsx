import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icons } from './icons'
import Avatar from './Avatar'

const PAGE_TITLES = {
  '/dashboard':       'Dashboard',
  '/submissions/new': 'Ajukan Permohonan P3B',
  '/approval-queue':  'Antrean Persetujuan',
  '/documents':       'Brankas Dokumen',
}

export default function TopBar({ onLogout }) {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const title = Object.entries(PAGE_TITLES).find(([p]) =>
    pathname.startsWith(p)
  )?.[1] || 'TreatyIQ'

  return (
    <header className="tiq-top">
      <div className="tiq-top-left">
        <div className="tiq-crumbs">
          <span>TreatyIQ</span>
          <span className="tiq-crumb-sep">/</span>
          <span className="tiq-crumb-current">{title}</span>
        </div>
      </div>

      <div className="tiq-top-search">
        <span className="tiq-top-search-icon">{Icons.search}</span>
        <input placeholder="Cari vendor, ID permohonan, dokumen…" />
        <kbd className="tiq-kbd">⌘K</kbd>
      </div>

      <div className="tiq-top-right">
        <button className="tiq-icon-btn" aria-label="Notifikasi">
          {Icons.bell}
          <span className="tiq-icon-btn-dot" />
        </button>
        <div className="tiq-top-divider" />
        <div className="tiq-top-user">
          <Avatar name={user?.full_name} role={user?.role} size={30} />
          <div className="tiq-top-user-info">
            <div className="tiq-top-user-name">{user?.full_name}</div>
            <div className="tiq-top-user-co">{user?.company_name}</div>
          </div>
        </div>
        <button className="tiq-icon-btn" onClick={onLogout} aria-label="Keluar" title="Keluar">
          {Icons.logout}
        </button>
      </div>
    </header>
  )
}
