import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getDocuments } from '../api/documents'
import { Icons } from '../components/icons'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'

const DOC_TYPE_LABELS = {
  dgt1:              'Form DGT-1',
  cor:               'Certificate of Residence',
  service_agreement: 'Service Agreement',
  beneficial_owner:  'Beneficial Owner Decl.',
  economic_substance:'Bukti Economic Substance',
}

const DOC_TYPE_KEYS = Object.keys(DOC_TYPE_LABELS)

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

export default function DocumentVault() {
  const [vendorFilter, setVendorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

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

  const filtered = typeFilter
    ? all.filter((d) => d.document_type === typeFilter)
    : all

  const countByType = (key) =>
    key ? all.filter((d) => d.document_type === key).length : all.length

  return (
    <div className="tiq-page">
      <div className="tiq-page-head">
        <div>
          <h1 className="tiq-h1">Brankas dokumen</h1>
          <p className="tiq-page-sub">Arsip dokumen kepatuhan P3B siap audit DJP — {all.length} dokumen</p>
        </div>
        <div className="tiq-page-head-actions">
          <button className="tiq-btn tiq-btn-ghost">
            {Icons.upload} Unggah dokumen
          </button>
          <button
            className="tiq-btn tiq-btn-primary"
            onClick={() => toast('Fitur ekspor PDF segera hadir', { icon: '🔔' })}
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
                          style={{ display:'inline-flex', color:'var(--text-muted)' }}
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
    </div>
  )
}
