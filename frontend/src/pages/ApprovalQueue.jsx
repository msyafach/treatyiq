import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSubmissions, approveSubmission, rejectSubmission } from '../api/submissions'
import StatusBadge from '../components/StatusBadge'
import { formatIDR, COUNTRY_FLAGS, INCOME_LABELS } from '../utils/treatyRates'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const TABS = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Ditandai', value: 'flagged' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
]

export default function ApprovalQueue() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  if (user?.role !== 'company_tax_team') {
    return <Navigate to="/dashboard" replace />
  }

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', activeTab],
    queryFn: () => getSubmissions(activeTab ? { status: activeTab } : {}).then(r => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id) => approveSubmission(id),
    onSuccess: () => {
      toast.success('Permohonan disetujui')
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal menyetujui permohonan'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectSubmission(id, reason),
    onSuccess: () => {
      toast.success('Permohonan ditolak')
      setRejectModal(null)
      setRejectReason('')
      qc.invalidateQueries({ queryKey: ['submissions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: () => toast.error('Gagal menolak permohonan'),
  })

  const submissions = data?.results || data || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Antrean Persetujuan</h1>
        <p className="text-sm text-muted mt-0.5">Tinjau dan setujui permohonan penerapan tarif P3B</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-muted hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <p>Tidak ada permohonan ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`card p-5 ${s.risk_flagged ? 'border-red-200 bg-red-50/30' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{s.vendor_name}</h3>
                    <span className="text-muted text-sm">•</span>
                    <span className="text-sm text-gray-600">
                      {COUNTRY_FLAGS[s.country]} {s.country_display}
                    </span>
                    <StatusBadge status={s.status} />
                    {s.risk_flagged && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={11} /> Perlu Tinjauan Manual
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>{INCOME_LABELS[s.income_type] || s.income_type_display}</span>
                    <span className="font-mono">{formatIDR(s.amount_idr)}</span>
                    <span>
                      Tarif P3B: <strong className="text-primary">{s.treaty_rate_pct}%</strong>
                    </span>
                    <span className="text-muted">{s.legal_basis}</span>
                  </div>
                  {s.risk_flags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.risk_flags.map((flag, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.rejection_reason && (
                    <p className="mt-2 text-xs text-red-600">
                      Alasan penolakan: {s.rejection_reason}
                    </p>
                  )}
                </div>

                {(s.status === 'pending' || s.status === 'flagged') && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveMutation.mutate(s.id)}
                      disabled={approveMutation.isPending}
                      className="btn-success flex items-center gap-1.5 text-sm py-1.5"
                    >
                      <Check size={15} /> Setujui
                    </button>
                    <button
                      onClick={() => setRejectModal(s)}
                      className="btn-danger flex items-center gap-1.5 text-sm py-1.5"
                    >
                      <X size={15} /> Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Tolak Permohonan</h3>
            <p className="text-sm text-muted mb-4">
              Permohonan dari <strong>{rejectModal.vendor_name}</strong> akan ditolak.
              Tarif domestik 20% akan diterapkan.
            </p>
            <label className="label">Alasan Penolakan</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Jelaskan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="btn-danger"
              >
                {rejectMutation.isPending ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
