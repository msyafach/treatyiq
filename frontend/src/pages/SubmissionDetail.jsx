import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getSubmission, approveSubmission, rejectSubmission, revokeSubmission } from '../api/submissions'
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

function DocList({ submissionId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['documents', submissionId],
    queryFn: () => getDocuments({ submission: submissionId }).then(r => r.data),
  })
  const docs = data?.results ?? data ?? []

  if (isLoading) return <div className="tiq-docpanel-loading"><div className="tiq-spinner" style={{ width: 18, height: 18 }} /> Memuat dokumen…</div>
  if (docs.length === 0) return <div className="tiq-docpanel-empty">Belum ada dokumen yang diunggah.</div>

  return (
    <div className="tiq-docpanel">
      <div className="tiq-docpanel-list">
        {docs.map(doc => {
          const url = doc.file_url || doc.file
          const name = doc.filename || doc.file?.split('/').pop() || '—'
          return (
            <div key={doc.id} className="tiq-docpanel-item">
              <div className="tiq-docpanel-item-icon">{Icons.doc}</div>
              <div className="tiq-docpanel-item-info">
                <div className="tiq-docpanel-item-type">{DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}</div>
                <div className="tiq-docpanel-item-name">{name}</div>
              </div>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="tiq-btn tiq-btn-ghost tiq-btn-sm">
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

export default function SubmissionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isTaxTeam = user?.role === 'company_tax_team'

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [revokeOpen, setRevokeOpen] = useState(false)

  const { data: s, isLoading, isError } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => getSubmission(id).then(r => r.data),
  })

  const approveMut = useMutation({
    mutationFn: () => approveSubmission(id),
    onSuccess: () => {
      toast.success('Permohonan disetujui')
      qc.invalidateQueries({ queryKey: ['submission', id] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal menyetujui permohonan'),
  })

  const rejectMut = useMutation({
    mutationFn: () => rejectSubmission(id, rejectReason),
    onSuccess: () => {
      toast.success('Permohonan ditolak')
      setRejectOpen(false)
      setRejectReason('')
      qc.invalidateQueries({ queryKey: ['submission', id] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal menolak permohonan'),
  })

  const revokeMut = useMutation({
    mutationFn: () => revokeSubmission(id),
    onSuccess: () => {
      toast.success('Keputusan dibatalkan')
      setRevokeOpen(false)
      qc.invalidateQueries({ queryKey: ['submission', id] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal membatalkan keputusan'),
  })

  const backTo = isTaxTeam ? '/approval-queue' : '/dashboard'

  if (isLoading) return (
    <div className="tiq-page">
      <div className="tiq-loading"><div className="tiq-spinner" /></div>
    </div>
  )

  if (isError || !s) return (
    <div className="tiq-page">
      <div className="tiq-empty">
        <div className="tiq-empty-icon">{Icons.alert}</div>
        <div className="tiq-empty-title">Permohonan tidak ditemukan</div>
        <button className="tiq-btn tiq-btn-primary" style={{ marginTop: 14 }} onClick={() => navigate(backTo)}>
          Kembali
        </button>
      </div>
    </div>
  )

  const savings = s.amount_idr * (20 - (s.treaty_rate_pct ?? 20)) / 100
  const canAct = isTaxTeam && (s.status === 'pending' || s.status === 'flagged')
  const canRevoke = isTaxTeam && (s.status === 'approved' || s.status === 'rejected')

  return (
    <div className="tiq-page">
      <button className="tiq-btn tiq-btn-ghost" style={{ marginBottom: 16, alignSelf: 'flex-start' }} onClick={() => navigate(backTo)}>
        {Icons.arrowLeft} Kembali
      </button>

      <div className="tiq-page-head" style={{ marginBottom: 24 }}>
        <div>
          <div className="tiq-eyebrow">Permohonan #{String(s.id).padStart(5, '0')}</div>
          <h1 className="tiq-h1" style={{ marginBottom: 10 }}>{s.vendor_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={s.status} />
            {s.risk_flagged && <span className="tiq-flag-pill">{Icons.alert} Tinjauan manual</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Main detail card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="tiq-card">
            <div className="tiq-card-head">
              <h3 className="tiq-card-title">Identitas vendor</h3>
            </div>
            <dl className="tiq-dl">
              <dt>Perusahaan</dt>
              <dd style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={s.vendor_name} size={24} /> {s.vendor_name}
              </dd>
              <dt>Negara domisili</dt>
              <dd><CountryChip country={s.country} /></dd>
              <dt>Nomor pajak asing</dt>
              <dd><code className="tiq-mono">{s.foreign_tax_id || '—'}</code></dd>
              <dt>Diajukan</dt>
              <dd>{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</dd>
              {s.reviewed_by_name && <><dt>Ditinjau oleh</dt><dd>{s.reviewed_by_name}</dd></>}
            </dl>
          </section>

          <section className="tiq-card">
            <div className="tiq-card-head">
              <h3 className="tiq-card-title">Penghasilan &amp; tarif</h3>
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
                <div className="tiq-cell-label">Penghematan pajak</div>
                <div className="tiq-cell-value tiq-mono" style={{ color: 'var(--success)' }}>{formatIDR(savings)}</div>
              </div>
              <div className="tiq-app-cell-wide">
                <div className="tiq-cell-label">Dasar hukum</div>
                <div className="tiq-cell-value tiq-cell-basis">{Icons.scales} {s.legal_basis}</div>
              </div>
            </div>

            {s.rejection_reason && (
              <div className="tiq-app-reject" style={{ marginTop: 16 }}>
                <strong>Alasan penolakan:</strong> {s.rejection_reason}
              </div>
            )}
          </section>

          {s.risk_flags?.length > 0 && (
            <section className="tiq-card">
              <div className="tiq-card-head">
                <h3 className="tiq-card-title">Risiko terdeteksi</h3>
              </div>
              <div className="tiq-app-flags">
                <div className="tiq-flag-banner-icon">{Icons.alert}</div>
                <div>
                  <div className="tiq-flag-banner-title">Sistem mendeteksi {s.risk_flags.length} risiko PPT</div>
                  <ul className="tiq-flag-banner-list">
                    {s.risk_flags.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <section className="tiq-card">
            <div className="tiq-card-head">
              <h3 className="tiq-card-title">{Icons.folder} Dokumen ({s.documents?.length ?? 0})</h3>
            </div>
            <DocList submissionId={s.id} />
          </section>
        </div>

        {/* Action sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {canAct && (
            <section className="tiq-card">
              <div className="tiq-card-head">
                <h3 className="tiq-card-title">Tindakan</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 0 4px' }}>
                <button
                  className="tiq-btn tiq-btn-success"
                  disabled={approveMut.isPending}
                  onClick={() => approveMut.mutate()}
                >
                  {approveMut.isPending ? 'Memproses…' : <>{Icons.check} Setujui permohonan</>}
                </button>
                <button
                  className="tiq-btn tiq-btn-danger-ghost"
                  onClick={() => setRejectOpen(true)}
                >
                  {Icons.x} Tolak permohonan
                </button>
              </div>
            </section>
          )}

          {canRevoke && (
            <section className="tiq-card">
              <div className="tiq-card-head">
                <h3 className="tiq-card-title">Tindakan</h3>
              </div>
              <div style={{ padding: '0 0 4px' }}>
                <button className="tiq-btn tiq-btn-ghost" style={{ width: '100%' }} onClick={() => setRevokeOpen(true)}>
                  {Icons.edit} Batalkan keputusan
                </button>
              </div>
            </section>
          )}

          <section className="tiq-card">
            <div className="tiq-card-head">
              <h3 className="tiq-card-title">Kepatuhan PMK 112</h3>
            </div>
            <dl className="tiq-dl">
              <dt>Beneficial owner</dt>
              <dd>{s.is_beneficial_owner ? '✓ Ya' : '✗ Tidak'}</dd>
              <dt>Principal Purpose Test</dt>
              <dd>{s.passes_ppt ? '✓ Lulus' : '✗ Gagal'}</dd>
              <dt>Substansi ekonomi</dt>
              <dd>{s.has_economic_substance ? '✓ Ada' : '✗ Tidak ada'}</dd>
              {s.has_permanent_establishment !== null && s.has_permanent_establishment !== undefined && (
                <><dt>BUT di Indonesia</dt><dd>{s.has_permanent_establishment ? '✗ Ya (risiko)' : '✓ Tidak'}</dd></>
              )}
            </dl>
          </section>
        </div>
      </div>

      {/* Reject modal */}
      {rejectOpen && (
        <div className="tiq-modal-backdrop" onClick={() => setRejectOpen(false)}>
          <div className="tiq-modal" onClick={e => e.stopPropagation()}>
            <div className="tiq-modal-head">
              <div>
                <h3>Tolak permohonan?</h3>
                <p>Tarif domestik 20% akan diterapkan untuk {s.vendor_name}.</p>
              </div>
              <button className="tiq-icon-btn" onClick={() => setRejectOpen(false)}>{Icons.x}</button>
            </div>
            <label className="tiq-label">Alasan penolakan <span className="tiq-req">*</span></label>
            <textarea
              className="tiq-input tiq-textarea"
              rows={4}
              placeholder="Jelaskan alasan penolakan agar vendor bisa memperbaiki…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="tiq-modal-foot">
              <button className="tiq-btn tiq-btn-ghost" onClick={() => setRejectOpen(false)}>Batal</button>
              <button
                className="tiq-btn tiq-btn-danger"
                disabled={rejectMut.isPending || !rejectReason.trim()}
                onClick={() => rejectMut.mutate()}
              >
                {rejectMut.isPending ? 'Memproses…' : 'Konfirmasi tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke modal */}
      {revokeOpen && (
        <div className="tiq-modal-backdrop" onClick={() => setRevokeOpen(false)}>
          <div className="tiq-modal" onClick={e => e.stopPropagation()}>
            <div className="tiq-modal-head">
              <div>
                <h3>Batalkan keputusan?</h3>
                <p>Permohonan <strong>{s.vendor_name}</strong> akan kembali ke status <strong>Menunggu</strong>.</p>
              </div>
              <button className="tiq-icon-btn" onClick={() => setRevokeOpen(false)}>{Icons.x}</button>
            </div>
            <div className="tiq-modal-foot">
              <button className="tiq-btn tiq-btn-ghost" onClick={() => setRevokeOpen(false)}>Batal</button>
              <button
                className="tiq-btn tiq-btn-warning"
                disabled={revokeMut.isPending}
                onClick={() => revokeMut.mutate()}
              >
                {revokeMut.isPending ? 'Memproses…' : `${Icons.edit} Batalkan keputusan`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
