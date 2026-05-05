import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Clock, CheckCircle, TrendingUp, Plus, Eye } from 'lucide-react'
import { getDashboardStats } from '../api/submissions'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { formatIDR, COUNTRY_FLAGS, INCOME_LABELS } from '../utils/treatyRates'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then(r => r.data),
  })

  const stats = data || {}
  const submissions = stats.recent_submissions || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">
            Ringkasan kepatuhan pajak P3B {user?.company_name}
          </p>
        </div>
        <button
          onClick={() => navigate('/submissions/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Ajukan Permohonan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Vendor"
          value={isLoading ? '—' : stats.total_vendors ?? 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={isLoading ? '—' : stats.pending_approvals ?? 0}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Disetujui Bulan Ini"
          value={isLoading ? '—' : stats.approved_this_month ?? 0}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Total Penghematan Pajak"
          value={isLoading ? '—' : formatIDR(stats.total_tax_savings_idr || 0)}
          icon={TrendingUp}
          color="primary"
          subtitle="vs tarif domestik 20%"
        />
      </div>

      {/* Recent submissions */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Permohonan Terkini</h2>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <p>Belum ada permohonan.</p>
            <button onClick={() => navigate('/submissions/new')} className="btn-primary mt-3">
              Ajukan Permohonan Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-muted">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Negara</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Jenis Penghasilan</th>
                  <th className="text-right px-4 py-3 font-medium text-muted">Jumlah (IDR)</th>
                  <th className="text-center px-4 py-3 font-medium text-muted">Tarif P3B</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Dasar Hukum</th>
                  <th className="text-center px-4 py-3 font-medium text-muted">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.vendor_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {COUNTRY_FLAGS[s.country]} {s.country_display}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{INCOME_LABELS[s.income_type] || s.income_type_display}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-800">{formatIDR(s.amount_idr)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${s.treaty_rate_pct === 0 ? 'text-success' : 'text-primary'}`}>
                        {s.treaty_rate_pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted max-w-[180px] truncate">{s.legal_basis}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/submissions/${s.id}`)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Eye size={16} />
                      </button>
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
