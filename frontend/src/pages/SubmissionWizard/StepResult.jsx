import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatIDR, COUNTRY_FLAGS, COUNTRY_LABELS, INCOME_LABELS } from '../../utils/treatyRates'
import StatusBadge from '../../components/StatusBadge'

export default function StepResult({ result }) {
  const navigate = useNavigate()
  const treatyPct = parseFloat(result.treaty_rate_pct ?? result.treaty_rate * 100)
  const domesticPct = 20
  const savings = parseFloat(result.tax_savings_idr) || 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Permohonan Berhasil Diajukan</h1>
        <p className="text-sm text-muted mt-0.5">
          Nomor referensi: <span className="font-mono font-semibold text-primary">TIQ-{String(result.id).padStart(6, '0')}</span>
        </p>
      </div>

      {result.risk_flagged && (
        <div className="card p-4 mb-4 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Memerlukan Tinjauan Manual</p>
              <p className="text-sm text-red-600 mt-1">
                Permohonan ini ditandai untuk tinjauan substantif oleh Tim Pajak sebelum tarif P3B dapat diterapkan.
              </p>
              {result.risk_flags?.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {result.risk_flags.map((flag, i) => (
                    <li key={i} className="text-xs text-red-700">• {flag}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Ringkasan Permohonan</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted">Vendor</span>
            <p className="font-medium text-gray-900 mt-0.5">{result.vendor_name}</p>
          </div>
          <div>
            <span className="text-muted">Negara</span>
            <p className="font-medium text-gray-900 mt-0.5">
              {COUNTRY_FLAGS[result.country]} {COUNTRY_LABELS[result.country] || result.country_display}
            </p>
          </div>
          <div>
            <span className="text-muted">Jenis Penghasilan</span>
            <p className="font-medium text-gray-900 mt-0.5">{INCOME_LABELS[result.income_type] || result.income_type_display}</p>
          </div>
          <div>
            <span className="text-muted">Jumlah Penghasilan</span>
            <p className="font-medium font-mono text-gray-900 mt-0.5">{formatIDR(result.amount_idr)}</p>
          </div>
          <div>
            <span className="text-muted">Status</span>
            <div className="mt-0.5"><StatusBadge status={result.status} /></div>
          </div>
          <div>
            <span className="text-muted">Dasar Hukum</span>
            <p className="font-medium text-gray-900 mt-0.5 text-xs">{result.legal_basis}</p>
          </div>
        </div>
      </div>

      {/* Rate comparison */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Perbandingan Tarif Pajak</h2>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-xs text-muted mb-1">Tarif Domestik</div>
            <div className="text-3xl font-bold text-gray-700">{domesticPct}%</div>
            <div className="text-xs text-muted mt-1">PPh Pasal 26</div>
          </div>
          <div className="flex items-center justify-center">
            <TrendingUp size={24} className="text-success" />
          </div>
          <div className="p-4 bg-success-light rounded-xl">
            <div className="text-xs text-muted mb-1">Tarif P3B</div>
            <div className="text-3xl font-bold text-success">{treatyPct}%</div>
            <div className="text-xs text-muted mt-1">{result.legal_basis?.split(' ').slice(0, 2).join(' ')}</div>
          </div>
        </div>

        {savings > 0 ? (
          <div className="bg-success-light rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-success mb-1">
              <CheckCircle size={18} />
              <span className="font-semibold">Estimasi Penghematan Pajak</span>
            </div>
            <div className="text-2xl font-bold text-success">{formatIDR(savings)}</div>
            <div className="text-xs text-green-700 mt-1">vs tarif domestik 20%</div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-sm text-red-700 font-medium">
              Tarif domestik 20% diterapkan karena permohonan memerlukan tinjauan manual.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
          Lihat Semua Permohonan
        </button>
        <button onClick={() => navigate('/submissions/new')} className="btn-primary flex-1">
          Ajukan Permohonan Baru
        </button>
      </div>
    </div>
  )
}
