import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icons } from './icons'
import Avatar from './Avatar'
import { getSubmissions } from '../api/submissions'

const PAGE_TITLES = {
  '/dashboard':       'Dashboard',
  '/submissions/new': 'Ajukan Permohonan P3B',
  '/approval-queue':  'Antrean Persetujuan',
  '/documents':       'Brankas Dokumen',
}

const STATUS_LABEL = {
  pending:  'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  flagged:  'Ditandai',
}

export default function TopBar({ onLogout }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching]   = useState(false)

  const [notifOpen, setNotifOpen]       = useState(false)
  const [notifs, setNotifs]             = useState([])
  const [unreadCount, setUnreadCount]   = useState(0)

  const searchRef  = useRef(null)
  const notifRef   = useRef(null)
  const debounceId = useRef(null)

  const title = Object.entries(PAGE_TITLES).find(([p]) =>
    pathname.startsWith(p)
  )?.[1] || 'TreatyIQ'

  // ── Search ────────────────────────────────────────────────
  const handleQueryChange = useCallback((value) => {
    setQuery(value)
    clearTimeout(debounceId.current)
    if (!value.trim()) { setResults([]); setSearchOpen(false); return }
    debounceId.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await getSubmissions({ search: value })
        const items = res.data.results ?? res.data
        setResults(items)
        setSearchOpen(true)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 400)
  }, [])

  const handleResultClick = (s) => {
    setSearchOpen(false)
    setQuery('')
    navigate(`/submissions/${s.id}`)
  }

  // ── Notifications ─────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    if (!user) return
    try {
      const params = user.role === 'company_tax_team'
        ? { status: 'pending' }
        : {}
      const res = await getSubmissions(params)
      const items = (res.data.results ?? res.data).slice(0, 10)
      setNotifs(items)
      setUnreadCount(res.data.count ?? items.length)
    } catch { /* silent */ }
  }, [user])

  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [fetchNotifs])

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (notifRef.current  && !notifRef.current.contains(e.target))  setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // ── ⌘K shortcut ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.querySelector('input')?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="tiq-top">
      <div className="tiq-top-left">
        <div className="tiq-crumbs">
          <span>TreatyIQ</span>
          <span className="tiq-crumb-sep">/</span>
          <span className="tiq-crumb-current">{title}</span>
        </div>
      </div>

      {/* Search */}
      <div className="tiq-top-search" ref={searchRef}>
        <span className="tiq-top-search-icon">{Icons.search}</span>
        <input
          placeholder="Cari vendor, ID permohonan, dokumen…"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          onFocus={() => results.length > 0 && setSearchOpen(true)}
        />
        <kbd className="tiq-kbd">⌘K</kbd>

        {searchOpen && (
          <div className="tiq-search-dropdown">
            {searching ? (
              <div className="tiq-search-empty">Mencari…</div>
            ) : results.length === 0 ? (
              <div className="tiq-search-empty">Tidak ada hasil untuk &ldquo;{query}&rdquo;</div>
            ) : results.map(s => (
              <button key={s.id} className="tiq-search-item" onClick={() => handleResultClick(s)}>
                <div className="tiq-search-item-main">
                  <span className="tiq-search-item-name">{s.vendor_name}</span>
                  <span className={`tiq-search-item-badge tiq-sbadge-${s.status}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </div>
                <div className="tiq-search-item-sub">
                  #{String(s.id).padStart(5, '0')} · {s.country} · {s.income_type?.replace(/_/g, ' ')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tiq-top-right">
        {/* Notifications */}
        <div className="tiq-notif-wrap" ref={notifRef}>
          <button
            className="tiq-icon-btn"
            aria-label="Notifikasi"
            onClick={() => setNotifOpen(v => !v)}
          >
            {Icons.bell}
            {unreadCount > 0 && (
              <span className="tiq-notif-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="tiq-notif-dropdown">
              <div className="tiq-notif-header">
                <span>
                  {user?.role === 'company_tax_team' ? 'Menunggu Persetujuan' : 'Permohonan Saya'}
                </span>
                {unreadCount > 0 && <span className="tiq-notif-header-count">{unreadCount}</span>}
              </div>
              {notifs.length === 0 ? (
                <div className="tiq-notif-empty">Tidak ada notifikasi</div>
              ) : notifs.map(s => (
                <button
                  key={s.id}
                  className="tiq-notif-item"
                  onClick={() => { setNotifOpen(false); navigate(`/submissions/${s.id}`) }}
                >
                  <div className="tiq-notif-item-name">{s.vendor_name}</div>
                  <div className="tiq-notif-item-meta">
                    <span className={`tiq-search-item-badge tiq-sbadge-${s.status}`}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                    <span className="tiq-notif-item-id">#{String(s.id).padStart(5, '0')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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
