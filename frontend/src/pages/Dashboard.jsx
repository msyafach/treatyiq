import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../api/submissions'
import { useAuth } from '../context/AuthContext'
import { useCountUp } from '../hooks/useCountUp'
import { Icons } from '../components/icons'
import StatusBadge from '../components/StatusBadge'
import CountryChip, { COUNTRY_MAP } from '../components/CountryChip'
import Avatar from '../components/Avatar'
import Sparkline from '../components/Sparkline'
import Donut from '../components/Donut'
import { formatIDR, INCOME_LABELS } from '../utils/treatyRates'

const SAVINGS_TREND = [
  {m:'Jun',v:1.2},{m:'Jul',v:1.8},{m:'Aug',v:2.1},{m:'Sep',v:1.6},
  {m:'Oct',v:2.4},{m:'Nov',v:3.1},{m:'Dec',v:2.8},{m:'Jan',v:3.4},
  {m:'Feb',v:2.9},{m:'Mar',v:3.7},{m:'Apr',v:4.2},{m:'May',v:4.6},
]

const COUNTRY_COLORS = ['#0095D6','#55B249','#F59E0B','#7C3AED','#EC4899','#06B6D4','#94A3B8']

function Stat({ label, value, sub, color, icon, delta }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  const display = typeof value === 'number' ? animated : value
  return (
    <div className="tiq-stat" style={{ '--c': color }}>
      <div className="tiq-stat-head">
        <div className="tiq-stat-icon">{icon}</div>
        {delta != null && (
          <span className={`tiq-delta ${delta >= 0 ? 'is-up' : 'is-down'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="tiq-stat-label">{label}</div>
      <div className="tiq-stat-value">{display}</div>
      {sub && <div className="tiq-stat-sub">{sub}</div>}
    </div>
  )
}

function DetailDrawer({ s, onClose }) {
  if (!s) return null
  const savings = s.amount_idr * (20 - (s.treaty_rate_pct ?? 20)) / 100
  return (
    <div className="tiq-drawer-backdrop" onClick={onClose}>
      <aside className="tiq-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="tiq-drawer-head">
          <div>
            <div className="tiq-eyebrow">{s.id}</div>
            <h2>{s.vendor_name}</h2>
          </div>
          <button className="tiq-icon-btn" onClick={onClose} aria-label="Tutup">{Icons.x}</button>
        </div>
        <div className="tiq-drawer-status-row">
          <StatusBadge status={s.status} />
          {s.risk_flagged && <span className="tiq-flag-pill">{Icons.alert} Tinjauan manual</span>}
          <span className="tiq-meta-sep">·</span>
          <CountryChip country={s.country} />
        </div>

        <div className="tiq-drawer-summary">
          <div>
            <div className="tiq-cell-label">Jumlah</div>
            <div className="tiq-drawer-stat-val tiq-mono">{formatIDR(s.amount_idr)}</div>
          </div>
          <div>
            <div className="tiq-cell-label">Tarif P3B</div>
            <div className="tiq-drawer-stat-val">
              <span className="tiq-rate-strike">20%</span> →&nbsp;
              <span className={`tiq-rate-pill ${s.treaty_rate_pct === 0 ? 'is-zero' : ''}`}>{s.treaty_rate_pct}%</span>
            </div>
          </div>
          <div>
            <div className="tiq-cell-label">Penghematan</div>
            <div className="tiq-drawer-stat-val tiq-mono" style={{ color: 'var(--success)' }}>
              {formatIDR(savings)}
            </div>
          </div>
        </div>

        <section className="tiq-drawer-section">
          <h4>Detail permohonan</h4>
          <dl className="tiq-dl">
            <dt>Jenis penghasilan</dt><dd>{INCOME_LABELS[s.income_type] || s.income_type_display}</dd>
            <dt>Dasar hukum</dt><dd>{s.legal_basis}</dd>
            <dt>Diajukan</dt><dd>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—'}</dd>
            {s.reviewed_by_name && <><dt>Disetujui oleh</dt><dd>{s.reviewed_by_name}</dd></>}
          </dl>
        </section>

        {s.risk_flags?.length > 0 && (
          <section className="tiq-drawer-section">
            <h4>Risiko terdeteksi</h4>
            <div className="tiq-app-flags">
              <div className="tiq-flag-banner-icon">{Icons.alert}</div>
              <ul className="tiq-flag-banner-list">
                {s.risk_flags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </section>
        )}
      </aside>
    </div>
  )
}

function exportLaporan(stats, user) {
  const submissions = stats.recent_submissions || []
  const exportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const rows = submissions.map((s) => `
    <tr>
      <td class="mono">${s.id}</td>
      <td>${s.vendor_name || '—'}</td>
      <td>${s.country || '—'}</td>
      <td>${INCOME_LABELS[s.income_type] || s.income_type_display || '—'}</td>
      <td class="num">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(s.amount_idr || 0)}</td>
      <td class="center">${s.treaty_rate_pct ?? '—'}%</td>
      <td>${s.status || '—'}</td>
    </tr>
  `).join('')

  const win = window.open('', '_blank')
  win.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Laporan Kepatuhan P3B — TreatyIQ</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 48px; font-size: 12px; color: #1e293b; }
        header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #0095D6; padding-bottom: 16px; }
        header h1 { font-size: 20px; font-weight: 700; }
        header p { font-size: 11px; color: #64748b; margin-top: 4px; }
        .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.8; }
        .summary { display: flex; gap: 24px; margin-bottom: 28px; }
        .summary-box { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; }
        .summary-box label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; }
        .summary-box .val { font-size: 18px; font-weight: 700; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
        .mono { font-family: monospace; font-size: 11px; }
        .num { text-align: right; }
        .center { text-align: center; }
        footer { margin-top: 32px; font-size: 10px; color: #94a3b8; text-align: center; }
        @media print { body { padding: 24px; } }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>Laporan Kepatuhan P3B</h1>
          <p>TreatyIQ · RSM Indonesia · ${user?.company_name || ''}</p>
        </div>
        <div class="meta">
          <div>Diekspor: ${exportDate}</div>
          <div>Oleh: ${user?.full_name || ''}</div>
        </div>
      </header>
      <div class="summary">
        <div class="summary-box">
          <label>Total Penghematan Pajak</label>
          <div class="val">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.total_tax_savings_idr || 0)}</div>
        </div>
        <div class="summary-box">
          <label>Menunggu Persetujuan</label>
          <div class="val">${stats.pending_approvals ?? 0}</div>
        </div>
        <div class="summary-box">
          <label>Disetujui Bulan Ini</label>
          <div class="val">${stats.approved_this_month ?? 0}</div>
        </div>
        <div class="summary-box">
          <label>Total Vendor</label>
          <div class="val">${stats.total_vendors ?? 0}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Vendor</th><th>Negara</th><th>Jenis Penghasilan</th><th class="num">Jumlah</th><th class="center">Tarif P3B</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <footer>Dokumen ini digenerate otomatis oleh sistem TreatyIQ. Harap verifikasi keakuratan data sebelum digunakan.</footer>
      <script>window.onload = () => { window.print() }</script>
    </body>
    </html>
  `)
  win.document.close()
}

const STATUS_COUNTS = (submissions) => {
  const c = { pending: 0, flagged: 0, approved: 0, rejected: 0 }
  submissions.forEach((s) => { if (c[s.status] !== undefined) c[s.status]++ })
  return c
}

function VendorDashboard({ user, isLoading, submissions, navigate }) {
  const counts = STATUS_COUNTS(submissions)
  const totalSavings = submissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + (s.amount_idr * (20 - (s.treaty_rate_pct ?? 20)) / 100), 0)

  return (
    <div className="tiq-page">
      <div className="tiq-page-head">
        <div>
          <div className="tiq-eyebrow">Halo, {user?.full_name?.split(' ')[0]}</div>
          <h1 className="tiq-h1">Permohonan P3B saya</h1>
          <p className="tiq-page-sub">{user?.company_name}</p>
        </div>
        <button className="tiq-btn tiq-btn-primary" onClick={() => navigate('/submissions/new')}>
          {Icons.plus} Ajukan permohonan baru
        </button>
      </div>

      <div className="tiq-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Total Permohonan" value={isLoading ? 0 : submissions.length} sub="semua status" color="#0095D6" icon={Icons.doc} />
        <Stat label="Menunggu" value={isLoading ? 0 : counts.pending + counts.flagged} sub="perlu tinjauan tim pajak" color="#F59E0B" icon={Icons.clock} />
        <Stat label="Disetujui" value={isLoading ? 0 : counts.approved} sub="tarif P3B diterapkan" color="#13A538" icon={Icons.checkCircle} />
        <Stat label="Penghematan" value={isLoading ? '—' : formatIDR(totalSavings)} sub="vs tarif domestik 20%" color="#7C3AED" icon={Icons.sparkle} />
      </div>

      <section className="tiq-card">
        <div className="tiq-card-head">
          <div>
            <h3 className="tiq-card-title">Daftar permohonan</h3>
            <p className="tiq-card-sub">{submissions.length} permohonan diurutkan berdasarkan tanggal</p>
          </div>
        </div>

        {isLoading ? (
          <div className="tiq-loading"><div className="tiq-spinner" /></div>
        ) : submissions.length === 0 ? (
          <div className="tiq-empty" style={{ border: 'none', borderRadius: 0 }}>
            <div className="tiq-empty-icon">{Icons.doc}</div>
            <div className="tiq-empty-title">Belum ada permohonan</div>
            <div className="tiq-empty-sub">Ajukan permohonan pertama untuk memulai.</div>
            <button className="tiq-btn tiq-btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/submissions/new')}>
              {Icons.plus} Ajukan Permohonan
            </button>
          </div>
        ) : (
          <div className="tiq-table-wrap">
            <table className="tiq-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor</th>
                  <th>Negara</th>
                  <th>Penghasilan</th>
                  <th className="ta-right">Jumlah</th>
                  <th className="ta-center">Tarif P3B</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className={s.risk_flagged ? 'is-flagged' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/submissions/${s.id}`)}
                  >
                    <td><code className="tiq-mono" style={{ fontSize: 12 }}>{s.id}</code></td>
                    <td className="td-vendor">
                      <Avatar name={s.vendor_name} size={28} />
                      <span>{s.vendor_name}</span>
                    </td>
                    <td><CountryChip country={s.country} /></td>
                    <td className="td-muted">{INCOME_LABELS[s.income_type] || s.income_type_display}</td>
                    <td className="ta-right tiq-mono">{formatIDR(s.amount_idr)}</td>
                    <td className="ta-center">
                      <span className={`tiq-rate-pill ${s.treaty_rate_pct === 0 ? 'is-zero' : ''}`}>
                        {s.treaty_rate_pct}%
                      </span>
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="ta-right">
                      <button className="tiq-icon-btn-sm" aria-label="Detail" onClick={(e) => { e.stopPropagation(); navigate(`/submissions/${s.id}`) }}>
                        {Icons.chevRight}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [drawer, setDrawer] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then((r) => r.data),
  })

  const stats = data || {}
  const submissions = stats.recent_submissions || []
  const totalSavings = stats.total_tax_savings_idr || 0
  const pending = stats.pending_approvals ?? 0
  const approved = stats.approved_this_month ?? 0
  const vendors = stats.total_vendors ?? 0

  if (user?.role === 'vendor') {
    return <VendorDashboard user={user} isLoading={isLoading} submissions={submissions} navigate={navigate} />
  }

  // Build country breakdown from recent submissions
  const byCountry = {}
  submissions.forEach((s) => {
    byCountry[s.country] = (byCountry[s.country] || 0) + 1
  })
  const countryEntries = Object.entries(byCountry)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  const flagged = submissions.filter((s) => s.risk_flagged)

  return (
    <div className="tiq-page">
      {/* Header */}
      <div className="tiq-page-head">
        <div>
          <div className="tiq-eyebrow">Halo, {user?.full_name?.split(' ')[0]}</div>
          <h1 className="tiq-h1">Ringkasan kepatuhan P3B</h1>
          <p className="tiq-page-sub">Periode: 1 Mei – 31 Mei 2026 · {user?.company_name}</p>
        </div>
        <div className="tiq-page-head-actions">
          <button className="tiq-btn tiq-btn-ghost" onClick={() => exportLaporan(stats, user)}>
            {Icons.download} Ekspor laporan
          </button>
          {user?.role !== 'company_tax_team' && (
            <button className="tiq-btn tiq-btn-primary" onClick={() => navigate('/submissions/new')}>
              {Icons.plus} Ajukan permohonan
            </button>
          )}
        </div>
      </div>

      {/* Hero savings + stats column */}
      <div className="tiq-dash-hero">
        <div className="tiq-savings-card">
          <div className="tiq-savings-meta">
            <span className="tiq-savings-pill">{Icons.sparkle} Total Penghematan Pajak</span>
            <span className="tiq-savings-period">vs tarif domestik 20%</span>
          </div>
          <div className="tiq-savings-value">
            {isLoading ? '—' : formatIDR(totalSavings)}
          </div>
          <div className="tiq-savings-row">
            <div>
              <div className="tiq-savings-stat-label">Bulan ini</div>
              <div className="tiq-savings-stat-value">{formatIDR(totalSavings * 0.32)}</div>
            </div>
            <div>
              <div className="tiq-savings-stat-label">YTD</div>
              <div className="tiq-savings-stat-value">{formatIDR(totalSavings)}</div>
            </div>
            <div>
              <div className="tiq-savings-stat-label">Tarif rata-rata</div>
              <div className="tiq-savings-stat-value">8.2%</div>
            </div>
          </div>
          <div className="tiq-savings-chart">
            <Sparkline data={SAVINGS_TREND} color="#FFFFFF" height={52} />
          </div>
        </div>

        <div className="tiq-stats-col">
          <Stat
            label="Total Vendor Terdaftar"
            value={isLoading ? 0 : vendors}
            sub="aktif 12 bulan terakhir"
            color="#0095D6"
            icon={Icons.users}

          />
          <Stat
            label="Menunggu Persetujuan"
            value={isLoading ? 0 : pending}
            sub="perlu tinjauan manual"
            color="#F59E0B"
            icon={Icons.clock}

          />
          <Stat
            label="Disetujui Bulan Ini"
            value={isLoading ? 0 : approved}
            sub="dari permohonan masuk"
            color="#13A538"
            icon={Icons.checkCircle}

          />
        </div>
      </div>

      {/* Country breakdown + flagged items */}
      <div className="tiq-dash-grid">
        <section className="tiq-card">
          <div className="tiq-card-head">
            <div>
              <h3 className="tiq-card-title">Sebaran negara mitra</h3>
              <p className="tiq-card-sub">{submissions.length} permohonan aktif</p>
            </div>
          </div>
          <div className="tiq-country-breakdown">
            {countryEntries.length > 0 ? (
              <>
                <Donut
                  size={140}
                  thickness={20}
                  segments={countryEntries.map((c, i) => ({
                    value: c.count,
                    color: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
                  }))}
                />
                <div className="tiq-country-legend">
                  {countryEntries.map((c, i) => {
                    const cd = COUNTRY_MAP[c.country]
                    const pct = submissions.length ? Math.round((c.count / submissions.length) * 100) : 0
                    return (
                      <div key={c.country} className="tiq-country-row">
                        <span className="tiq-country-row-dot" style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
                        <span className="tiq-country-row-flag">{cd?.flag || '🌍'}</span>
                        <span className="tiq-country-row-label">{cd?.label || c.country}</span>
                        <span className="tiq-country-row-count">{c.count}</span>
                        <span className="tiq-country-row-pct">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                {isLoading ? 'Memuat…' : 'Belum ada data'}
              </div>
            )}
          </div>
        </section>

        <section className="tiq-card">
          <div className="tiq-card-head">
            <div>
              <h3 className="tiq-card-title">Perlu perhatian Anda</h3>
              <p className="tiq-card-sub">Permohonan yang ditandai sistem</p>
            </div>
            <button className="tiq-btn-link" onClick={() => navigate('/approval-queue')}>Lihat semua →</button>
          </div>
          <div className="tiq-flag-list">
            {flagged.length === 0 && (
              <div className="tiq-flag-empty-spacer">
                <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text-muted)', fontSize:12 }}>
                  <span style={{ color:'var(--success)' }}>{Icons.checkCircle}</span>
                  {isLoading ? 'Memuat…' : 'Semua permohonan sudah lolos validasi otomatis.'}
                </div>
              </div>
            )}
            {flagged.slice(0, 3).map((s) => (
              <button key={s.id} className="tiq-flag-item" onClick={() => setDrawer(s)}>
                <div className="tiq-flag-icon">{Icons.alert}</div>
                <div className="tiq-flag-content">
                  <div className="tiq-flag-vendor">{s.vendor_name}</div>
                  <div className="tiq-flag-meta">
                    <CountryChip country={s.country} />
                    <span className="tiq-mono">{formatIDR(s.amount_idr)}</span>
                  </div>
                  {s.risk_flags?.length > 0 && (
                    <div className="tiq-flag-reasons">
                      {s.risk_flags.map((f) => <span key={f} className="tiq-flag-reason">{f}</span>)}
                    </div>
                  )}
                </div>
                <span className="tiq-flag-arrow">{Icons.chevRight}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Recent submissions table */}
      <section className="tiq-card">
        <div className="tiq-card-head">
          <div>
            <h3 className="tiq-card-title">Permohonan terkini</h3>
            <p className="tiq-card-sub">{submissions.length} permohonan diurutkan berdasarkan tanggal</p>
          </div>
          <div className="tiq-card-head-actions">
            <button className="tiq-btn-link" onClick={() => navigate('/approval-queue')}>Lihat semua →</button>
          </div>
        </div>

        {isLoading ? (
          <div className="tiq-loading"><div className="tiq-spinner" /></div>
        ) : submissions.length === 0 ? (
          <div className="tiq-empty" style={{ border: 'none', borderRadius: 0 }}>
            <div className="tiq-empty-icon">{Icons.doc}</div>
            <div className="tiq-empty-title">Belum ada permohonan</div>
            <div className="tiq-empty-sub">Ajukan permohonan pertama untuk memulai.</div>
            {user?.role !== 'company_tax_team' && (
              <button className="tiq-btn tiq-btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/submissions/new')}>
                {Icons.plus} Ajukan Permohonan
              </button>
            )}
          </div>
        ) : (
          <div className="tiq-table-wrap">
            <table className="tiq-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor</th>
                  <th>Negara</th>
                  <th>Penghasilan</th>
                  <th className="ta-right">Jumlah</th>
                  <th className="ta-center">Tarif P3B</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className={s.risk_flagged ? 'is-flagged' : ''}
                    onClick={() => setDrawer(s)}
                  >
                    <td><code className="tiq-mono" style={{ fontSize: 12 }}>{s.id}</code></td>
                    <td className="td-vendor">
                      <Avatar name={s.vendor_name} size={28} />
                      <span>{s.vendor_name}</span>
                    </td>
                    <td><CountryChip country={s.country} /></td>
                    <td className="td-muted">{INCOME_LABELS[s.income_type] || s.income_type_display}</td>
                    <td className="ta-right tiq-mono">{formatIDR(s.amount_idr)}</td>
                    <td className="ta-center">
                      <span className={`tiq-rate-pill ${s.treaty_rate_pct === 0 ? 'is-zero' : ''}`}>
                        {s.treaty_rate_pct}%
                      </span>
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="ta-right">
                      <button className="tiq-icon-btn-sm" aria-label="Detail" onClick={(e) => { e.stopPropagation(); setDrawer(s) }}>
                        {Icons.chevRight}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {drawer && <DetailDrawer s={drawer} onClose={() => setDrawer(null)} />}
    </div>
  )
}
