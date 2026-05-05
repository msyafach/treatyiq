import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, FileArchive } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDocuments } from '../api/documents'
import StatusBadge from '../components/StatusBadge'

const DOC_TYPE_LABELS = {
  dgt1: 'Form DGT-1',
  cor: 'Certificate of Residence',
  service_agreement: 'Service Agreement',
  beneficial_owner: 'Beneficial Owner Docs',
  economic_substance: 'Bukti Economic Substance',
}

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatFileSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentVault() {
  const [vendorFilter, setVendorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['documents', vendorFilter, statusFilter],
    queryFn: () => {
      const params = {}
      if (vendorFilter) params.vendor = vendorFilter
      if (statusFilter) params.status = statusFilter
      return getDocuments(params).then(r => r.data)
    },
  })

  const documents = data?.results || data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Brankas Dokumen</h1>
          <p className="text-sm text-muted mt-0.5">Arsip dokumen kepatuhan P3B siap audit DJP</p>
        </div>
        <button
          onClick={() => toast('Fitur ekspor PDF segera hadir', { icon: '🔔' })}
          className="btn-secondary flex items-center gap-2"
        >
          <FileArchive size={16} />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari vendor..."
          className="input-field max-w-[240px]"
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
        />
        <select
          className="input-field max-w-[200px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="flagged">Ditandai</option>
        </select>
        {(vendorFilter || statusFilter) && (
          <button
            onClick={() => { setVendorFilter(''); setStatusFilter('') }}
            className="text-sm text-primary hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Tidak ada dokumen ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-muted">Nama Vendor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Jenis Dokumen</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Jenis Penghasilan</th>
                  <th className="text-center px-4 py-3 font-medium text-muted">Tahun Pajak</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Tanggal Upload</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Ukuran</th>
                  <th className="text-center px-4 py-3 font-medium text-muted">Status Permohonan</th>
                  <th className="px-4 py-3 font-medium text-muted">Unduh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{doc.vendor_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type_display}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.income_type_display}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{doc.tax_year}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(doc.created_at)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatFileSize(doc.file_size)}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={doc.submission_status} />
                    </td>
                    <td className="px-4 py-3">
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                          title="Unduh dokumen"
                        >
                          <Download size={16} />
                        </a>
                      ) : (
                        <span className="text-gray-300"><Download size={16} /></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
