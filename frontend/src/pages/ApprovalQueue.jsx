import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSubmissions, approveSubmission, rejectSubmission, revokeSubmission } from '../api/submissions'
import { getDocuments } from '../api/documents'
import { useAuth } from '../context/AuthContext'
import { Icons } from '../components/icons'
import StatusBadge from '../components/StatusBadge'
import CountryChip from '../components/CountryChip'
import Avatar from '../components/Avatar'
import { formatIDR, INCOME_LABELS } from '../utils/treatyRates'

const DOC_TYPE_LABELS = {
  dgt1:               'Form DGT-1',
  cor:                'Certificate of Residence',
  service_agreement:  'Service Agreement',
  beneficial_owner:   'Beneficial Owner Decl.',
  economic_substance: 'Bukti Economic Substance',
}

function DocPanel({ submissionId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['documents', submissionId],
    queryFn: () => getDocuments({ submission: submissionId }).then(r => r.data),
  })

  const docs = data?.results ?? data ?? []

  if (isLoading) return (
    <div className="tiq-docpanel-loading">
      <div className="tiq-spinner" style={{ width: 18, height: 18 }} /> Memuat dokumen…
    </div>
  )

  if (docs.length === 0) return (
    <div className="tiq-docpanel-empty">Belum ada dokumen yang diunggah.</div>
  )

  return (
    <div className="tiq-docpanel">
      <div className="tiq-docpanel-title">{Icons.folder} Dokumen yang diunggah ({docs.length})</div>
      <div className="tiq-docpanel-list">
        {docs.map(doc => {
          const url = doc.file_url || doc.file
          const name = doc.filename || doc.file?.split('/').pop() || '—'
          return (
            <div key={doc.id} className="tiq-docpanel-item">
              <div className="tiq-docpanel-item-icon">{Icons.doc}</div>
              <div className="tiq-docpanel-item-info">
                <div className="tiq-docpanel-item-type">
                  {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                </div>
                <div className="tiq-docpanel-item-name">{name}</div>
              </div>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tiq-btn tiq-btn-ghost tiq-btn-sm"
                >
                  {Icons.search} Preview
                </a>
              ) : (
                <span className="tiq-docpanel-item-unavail">Tidak tersedia</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TABS = [
  { key: 'all',      label: 'Semua' },
  { key: 'pending',  label: 'Menunggu',  dot: '#F59E0B' },
  { key: 'flagged',  label: 'Ditandai',  dot: '#EF4444' },
  { key: 'approved', label: 'Disetujui', dot: '#13A538' },
  { key: 'rejected', label: 'Ditolak',   dot: '#94A3B8' },
]

function ApprovalCard({ s, onReject, onApprove, onRevoke }) {
  const [docsOpen, setDocsOpen] = useState(false)
  const savings = s.amount_idr * (20 - (s.treaty_rate_pct ?? 20)) / 100

  return (
    <article className={`tiq-app-card ${s.risk_flagged ? 'is-flagged' : ''}`}>
      <div className="tiq-app-card-main">
        <div className="tiq-app-row">
          <div className="tiq-app-vendor-block">
            <Avatar name={s.vendor_name} size={42} />
            <div>
              <div className="tiq-app-vendor">{s.vendor_name}</div>
              <div className="tiq-app-meta">
                <code className="tiq-mono">{s.id}</code>
                <span className="tiq-meta-sep">·</span>
                <CountryChip country={s.country} />
                <span className="tiq-meta-sep">·</span>
                <span>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—'}</span>
              </div>
            </div>
          </div>
          <div className="tiq-app-status">
            <StatusBadge status={s.status} />
            {s.risk_flagged && (
              <span className="tiq-flag-pill">
                {Icons.alert} Tinjauan manual
              </span>
            )}
          </div>
        </div>

        <div className="tiq-app-grid">
          <div>
            <div className="tiq-cell-label">Jenis penghasilan</div>
            <div className="tiq-cell-value">{INCOME_LABELS[s.income_type] || s.income_type_display}</div>
          </div>
          <div>
            <div className="tiq-cell-label">Jumlah</div>
            <div className="tiq-cell-value tiq-mono">{formatIDR(s.amount_idr)}</div>
          </div>
          <div>
            <div className="tiq-cell-label">Tarif domestik → P3B</div>
            <div className="tiq-cell-value">
              <span className="tiq-rate-strike">20%</span>
              <span className="tiq-rate-arrow">→</span>
              <span className={`tiq-rate-pill ${s.treaty_rate_pct === 0 ? 'is-zero' : ''}`}>{s.treaty_rate_pct}%</span>
            </div>
          </div>
          <div>
            <div className="tiq-cell-label">Penghematan</div>
            <div className="tiq-cell-value tiq-mono" style={{ color: 'var(--success)' }}>
              {formatIDR(savings)}
            </div>
          </div>
          <div className="tiq-app-cell-wide">
            <div className="tiq-cell-label">Dasar hukum</div>
            <div className="tiq-cell-value tiq-cell-basis">
              {Icons.scales} {s.legal_basis}
            </div>
          </div>
        </div>

        {s.risk_flags?.length > 0 && (
          <div className="tiq-app-flags">
            <div className="tiq-flag-banner-icon">{Icons.alert}</div>
            <div>
              <div className="tiq-flag-banner-title">
                Sistem mendeteksi {s.risk_flags.length} risiko PPT
              </div>
              <ul className="tiq-flag-banner-list">
                {s.risk_flags.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
        )}

        {s.rejection_reason && (
          <div className="tiq-app-reject">
            <strong>Alasan penolakan:</strong> {s.rejection_reason}
          </div>
        )}
      </div>

      {(s.status === 'pending' || s.status === 'flagged') && (
        <div className="tiq-app-actions">
          <button className="tiq-btn tiq-btn-danger-ghost tiq-btn-sm" onClick={() => onReject(s)}>
            {Icons.x} Tolak
          </button>
          <button className="tiq-btn tiq-btn-success tiq-btn-sm" onClick={() => onApprove(s.id)}>
            {Icons.check} Setujui
          </button>
        </div>
      )}

      {(s.status === 'approved' || s.status === 'rejected') && (
        <div className="tiq-app-approved-meta">
          {s.status === 'approved' ? (
            <>
              <span style={{ color: 'var(--success)' }}>{Icons.checkCircle}</span>
              Disetujui oleh <strong style={{ marginLeft: 4 }}>{s.reviewed_by_name || '—'}</strong>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--danger)' }}>{Icons.x}</span>
              Ditolak oleh <strong style={{ marginLeft: 4 }}>{s.reviewed_by_name || '—'}</strong>
            </>
          )}
          <button
            className="tiq-btn tiq-btn-ghost tiq-btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => onRevoke(s)}
          >
            {Icons.edit} Batalkan keputusan
          </button>
        </div>
      )}

      <button
        className="tiq-app-docs-toggle"
        onClick={() => setDocsOpen((v) => !v)}
      >
        {Icons.folder}
        {docsOpen ? 'Sembunyikan dokumen' : 'Lihat dokumen'}
        <span className="tiq-app-docs-chevron" style={{ transform: docsOpen ? 'rotate(180deg)' : undefined }}>▾</span>
      </button>

      {docsOpen && <DocPanel submissionId={s.id} />}
    </article>
  )
}

export default function ApprovalQueue() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('all')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [revokeTarget, setRevokeTarget] = useState(null)

  if (user?.role !== 'company_tax_team') {
    return <Navigate to="/dashboard" replace />
  }

  // Filtered list for the active tab
  const { data, isLoading } = useQuery({
    queryKey: ['submissions', tab],
    queryFn: () => getSubmissions(tab !== 'all' ? { status: tab } : {}).then((r) => r.data),
  })

  // Global counts (always fetch all so tab badges are accurate)
  const { data: allData } = useQuery({
    queryKey: ['submissions', 'all'],
    queryFn: () => getSubmissions({}).then((r) => r.data),
  })

  const approveMut = useMutation({
    mutationFn: (id) => approveSubmission(id),
    onSuccess: () => {
      toast.success('Permohonan disetujui')
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal menyetujui permohonan'),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => rejectSubmission(id, reason),
    onSuccess: () => {
      toast.success('Permohonan ditolak')
      setRejectTarget(null)
      setRejectReason('')
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal menolak permohonan'),
  })

  const revokeMut = useMutation({
    mutationFn: (id) => revokeSubmission(id),
    onSuccess: () => {
      toast.success('Keputusan dibatalkan — permohonan kembali ke Menunggu')
      setRevokeTarget(null)
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal membatalkan keputusan'),
  })

  const submissions = data?.results || data || []
  const allSubmissions = allData?.results || allData || []

  // Global counts derived from the full unfiltered list
  const counts = {}
  allSubmissions.forEach((s) => { counts[s.status] = (counts[s.status] || 0) + 1 })
  counts.all = allSubmissions.length

  return (
    <div className="tiq-page">
      <div className="tiq-page-head">
        <div>
          <h1 className="tiq-h1">Antrean persetujuan</h1>
          <p className="tiq-page-sub">Tinjau, setujui, atau tolak permohonan tarif P3B</p>
        </div>
      </div>

      <div className="tiq-tabs-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tiq-tab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.dot && <span className="tiq-tab-dot" style={{ background: t.dot }} />}
            {t.label}
            <span className="tiq-tab-count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="tiq-loading"><div className="tiq-spinner" /></div>
      ) : submissions.length === 0 ? (
        <div className="tiq-empty">
          <div className="tiq-empty-icon">{Icons.checkCircle}</div>
          <div className="tiq-empty-title">Antrean kosong</div>
          <div className="tiq-empty-sub">Tidak ada permohonan dalam status ini.</div>
        </div>
      ) : (
        <div className="tiq-queue-list">
          {submissions.map((s) => (
            <ApprovalCard
              key={s.id}
              s={s}
              onReject={setRejectTarget}
              onApprove={(id) => approveMut.mutate(id)}
              onRevoke={setRevokeTarget}
            />
          ))}
        </div>
      )}

      {/* Revoke modal */}
      {revokeTarget && (
        <div className="tiq-modal-backdrop" onClick={() => setRevokeTarget(null)}>
          <div className="tiq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tiq-modal-head">
              <div>
                <h3>Batalkan keputusan?</h3>
                <p>
                  Permohonan <strong>{revokeTarget.vendor_name}</strong> akan kembali ke status{' '}
                  <strong>Menunggu</strong> dan dapat ditinjau ulang.
                </p>
              </div>
              <button className="tiq-icon-btn" onClick={() => setRevokeTarget(null)} aria-label="Tutup">
                {Icons.x}
              </button>
            </div>
            <div className="tiq-modal-foot">
              <button className="tiq-btn tiq-btn-ghost" onClick={() => setRevokeTarget(null)}>Batal</button>
              <button
                className="tiq-btn tiq-btn-warning"
                disabled={revokeMut.isPending}
                onClick={() => revokeMut.mutate(revokeTarget.id)}
              >
                {revokeMut.isPending ? 'Memproses…' : `${Icons.edit} Batalkan keputusan`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="tiq-modal-backdrop" onClick={() => setRejectTarget(null)}>
          <div className="tiq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tiq-modal-head">
              <div>
                <h3>Tolak permohonan?</h3>
                <p>Tarif domestik 20% akan diterapkan untuk {rejectTarget.vendor_name}.</p>
              </div>
              <button className="tiq-icon-btn" onClick={() => setRejectTarget(null)} aria-label="Tutup">
                {Icons.x}
              </button>
            </div>
            <label className="tiq-label">Alasan penolakan <span className="tiq-req">*</span></label>
            <textarea
              className="tiq-input tiq-textarea"
              rows={4}
              placeholder="Jelaskan alasan penolakan agar vendor bisa memperbaiki…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="tiq-modal-foot">
              <button className="tiq-btn tiq-btn-ghost" onClick={() => setRejectTarget(null)}>Batal</button>
              <button
                className="tiq-btn tiq-btn-danger"
                disabled={rejectMut.isPending || !rejectReason.trim()}
                onClick={() => rejectMut.mutate({ id: rejectTarget.id, reason: rejectReason })}
              >
                {rejectMut.isPending ? 'Memproses…' : 'Konfirmasi tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
