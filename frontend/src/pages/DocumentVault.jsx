import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getDocuments, uploadDocument } from '../api/documents'
import { getSubmissions } from '../api/submissions'
import { Icons } from '../components/icons'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'

const DOC_TYPE_LABELS = {
  dgt1:               'Form DGT-1',
  cor:                'Certificate of Residence',
  service_agreement:  'Service Agreement',
  beneficial_owner:   'Beneficial Owner Decl.',
  economic_substance: 'Bukti Economic Substance',
}
const DOC_TYPE_KEYS = Object.keys(DOC_TYPE_LABELS)
const MAX_SIZE = 10 * 1024 * 1024

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function exportAuditPDF(filtered) {
  const rows = filtered.map((doc) => `
    <tr>
      <td>${doc.file?.split('/').pop() || '—'}</td>
      <td>${doc.vendor_name || '—'}</td>
      <td>${DOC_TYPE_LABELS[doc.document_type] || doc.document_type || '—'}</td>
      <td>${doc.tax_year || '—'}</td>
      <td>${fmtDate(doc.created_at)}</td>
      <td>${doc.submission_status || '—'}</td>
    </tr>
  `).join('')

  const exportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const win = window.open('', '_blank')
  win.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Laporan Audit Dokumen P3B — TreatyIQ</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 48px; font-size: 12px; color: #1e293b; }
        header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #0095D6; padding-bottom: 16px; }
        header h1 { font-size: 20px; font-weight: 700; color: #0f172a; }
        header p { font-size: 11px; color: #64748b; margin-top: 4px; }
        .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        thead tr { background: #f8fafc; }
        th { text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
        tr:hover { background: #fafafa; }
        footer { margin-top: 32px; font-size: 10px; color: #94a3b8; text-align: center; }
        @media print { body { padding: 24px; } }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>Laporan Audit Dokumen P3B</h1>
          <p>TreatyIQ · RSM Indonesia · Sesuai PMK 112/2025</p>
        </div>
        <div class="meta">
          <div>Diekspor: ${exportDate}</div>
          <div>Total dokumen: ${filtered.length}</div>
        </div>
      </header>
      <table>
        <thead>
          <tr>
            <th>Nama Berkas</th>
            <th>Vendor</th>
            <th>Jenis Dokumen</th>
            <th>Tahun Pajak</th>
            <th>Diunggah</th>
            <th>Status</th>
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

function UploadModal({ onClose, qc }) {
  const fileRef = useRef(null)
  const [submissionId, setSubmissionId] = useState('')
  const [docType, setDocType] = useState('')
  const [file, setFile] = useState(null)

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['submissions-for-upload'],
    queryFn: () => getSubmissions().then((r) => r.data),
  })
  const subs = subsData?.results || subsData || []

  const mut = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('submission', submissionId)
      form.append('document_type', docType)
      form.append('file', file)
      return uploadDocument(form)
    },
    onSuccess: () => {
      toast.success('Dokumen berhasil diunggah')
      qc.invalidateQueries({ queryKey: ['documents'] })
      onClose()
    },
    onError: (err) => {
      const msg = err.response?.data
      toast.error(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Gagal mengunggah dokumen')
    },
  })

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > MAX_SIZE) {
      toast.error(`${f.name} melebihi batas ukuran 10 MB`)
      e.target.value = ''
      return
    }
    setFile(f)
  }

  const canSubmit = submissionId && docType && file && !mut.isPending

  return (
    <div className="tiq-modal-backdrop" onClick={onClose}>
      <div className="tiq-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="tiq-modal-head">
          <div>
            <h3>Unggah dokumen</h3>
            <p>Pilih permohonan dan jenis dokumen yang akan diunggah.</p>
          </div>
          <button className="tiq-icon-btn" onClick={onClose} aria-label="Tutup">{Icons.x}</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 4px' }}>
          <div>
            <label className="tiq-label">Permohonan <span className="tiq-req">*</span></label>
            <select
              className="tiq-input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              disabled={subsLoading}
            >
              <option value="">{subsLoading ? 'Memuat…' : 'Pilih permohonan…'}</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.vendor_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="tiq-label">Jenis dokumen <span className="tiq-req">*</span></label>
            <select
              className="tiq-input"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="">Pilih jenis…</option>
              {DOC_TYPE_KEYS.map((k) => (
                <option key={k} value={k}>{DOC_TYPE_LABELS[k]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="tiq-label">Berkas <span className="tiq-req">*</span></label>
            {file ? (
              <div className="tiq-upload-row is-uploaded" style={{ borderRadius: 'var(--r-md)' }}>
                <div className="tiq-upload-icon" style={{ color: 'var(--success)' }}>{Icons.checkCircle}</div>
                <div className="tiq-upload-meta">
                  <div className="tiq-upload-name">{file.name}</div>
                  <div className="tiq-upload-detail">{fmtSize(file.size)}</div>
                </div>
                <button type="button" className="tiq-btn tiq-btn-ghost tiq-btn-sm" onClick={() => { setFile(null); fileRef.current.value = '' }}>
                  Ganti
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="tiq-btn tiq-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                onClick={() => fileRef.current?.click()}
              >
                {Icons.upload} Pilih berkas · PDF, maks. 10 MB
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              className="tiq-file-hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFile}
            />
          </div>
        </div>

        <div className="tiq-modal-foot">
          <button className="tiq-btn tiq-btn-ghost" onClick={onClose}>Batal</button>
          <button
            className="tiq-btn tiq-btn-primary"
            disabled={!canSubmit}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? 'Mengunggah…' : <>{Icons.upload} Unggah dokumen</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DocumentVault() {
  const qc = useQueryClient()
  const [vendorFilter, setVendorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['documents', vendorFilter, statusFilter],
    queryFn: () => {
      const params = {}
      if (vendorFilter) params.vendor = vendorFilter
      if (statusFilter) params.status = statusFilter
      return getDocuments(params).then((r) => r.data)
    },
  })

  const all = data?.results || data || []
  const filtered = typeFilter ? all.filter((d) => d.document_type === typeFilter) : all
  const countByType = (key) => key ? all.filter((d) => d.document_type === key).length : all.length

  return (
    <div className="tiq-page">
      <div className="tiq-page-head">
        <div>
          <h1 className="tiq-h1">Brankas dokumen</h1>
          <p className="tiq-page-sub">Arsip dokumen kepatuhan P3B siap audit DJP — {all.length} dokumen</p>
        </div>
        <div className="tiq-page-head-actions">
          <button className="tiq-btn tiq-btn-ghost" onClick={() => setUploadOpen(true)}>
            {Icons.upload} Unggah dokumen
          </button>
          <button
            className="tiq-btn tiq-btn-primary"
            onClick={() => exportAuditPDF(filtered)}
          >
            {Icons.download} Ekspor PDF audit
          </button>
        </div>
      </div>

      {/* Doc-type pills */}
      <div className="tiq-vault-types">
        {[['', 'Semua'], ...DOC_TYPE_KEYS.map((k) => [k, DOC_TYPE_LABELS[k]])].map(([k, label]) => (
          <button
            key={k}
            className={`tiq-pill ${typeFilter === k ? 'is-active' : ''}`}
            onClick={() => setTypeFilter(k)}
          >
            <span>{label}</span>
            <span className="tiq-pill-count">{countByType(k)}</span>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="tiq-filter-row">
        <div className="tiq-input-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <span className="tiq-input-leading">{Icons.search}</span>
          <input
            className="tiq-input tiq-input-sm tiq-input-leading-pad"
            placeholder="Cari vendor atau nama berkas…"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          />
        </div>
        <select
          className="tiq-input tiq-input-sm"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua status</option>
          <option value="approved">Disetujui</option>
          <option value="pending">Menunggu</option>
          <option value="flagged">Ditandai</option>
          <option value="rejected">Ditolak</option>
        </select>
        {(vendorFilter || statusFilter || typeFilter) && (
          <button
            className="tiq-btn-link"
            onClick={() => { setVendorFilter(''); setStatusFilter(''); setTypeFilter('') }}
          >
            Reset filter
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span className="tiq-filter-count">{filtered.length} hasil</span>
      </div>

      {/* Table */}
      <section className="tiq-card">
        {isLoading ? (
          <div className="tiq-loading"><div className="tiq-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="tiq-empty" style={{ border: 'none', borderRadius: 0 }}>
            <div className="tiq-empty-icon">{Icons.doc}</div>
            <div className="tiq-empty-title">Tidak ada dokumen</div>
            <div className="tiq-empty-sub">Coba ubah filter atau unggah dokumen baru.</div>
          </div>
        ) : (
          <div className="tiq-table-wrap">
            <table className="tiq-table">
              <thead>
                <tr>
                  <th>Berkas</th>
                  <th>Vendor</th>
                  <th>Jenis dokumen</th>
                  <th>Tahun pajak</th>
                  <th>Diunggah</th>
                  <th className="ta-right">Ukuran</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id}>
                    <td className="td-doc">
                      <div className="tiq-doc-thumb">{Icons.doc}</div>
                      <span className="tiq-mono tiq-doc-name" style={{ fontSize: 12 }}>
                        {doc.file?.split('/').pop() || '—'}
                      </span>
                    </td>
                    <td className="td-vendor">
                      <Avatar name={doc.vendor_name} size={26} />
                      <span>{doc.vendor_name}</span>
                    </td>
                    <td className="td-muted">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type_display}</td>
                    <td className="td-muted">{doc.tax_year || '—'}</td>
                    <td className="td-muted tiq-mono">{fmtDate(doc.created_at)}</td>
                    <td className="ta-right td-muted tiq-mono">{fmtSize(doc.file_size)}</td>
                    <td><StatusBadge status={doc.submission_status} /></td>
                    <td className="ta-right">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tiq-icon-btn-sm"
                          style={{ display: 'inline-flex', color: 'var(--text-muted)' }}
                          aria-label="Unduh"
                        >
                          {Icons.download}
                        </a>
                      ) : (
                        <span className="tiq-icon-btn-sm" style={{ opacity: .3 }}>{Icons.download}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} qc={qc} />}
    </div>
  )
}
