import { useNavigate } from 'react-router-dom'
import { Icons } from '../../components/icons'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import CountryChip from '../../components/CountryChip'
import { formatIDR, INCOME_LABELS } from '../../utils/treatyRates'

export default function StepResult({ result }) {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const treatyPct = parseFloat(result.treaty_rate_pct ?? result.treaty_rate * 100)
  const savings   = parseFloat(result.tax_savings_idr) || 0
  const amount    = parseFloat(result.amount_idr) || 0
  const id        = result.id ? `TIQ-${String(result.id).padStart(6, '0')}` : result.id

  return (
    <div className="tiq-page tiq-wizard-success">
      <div className="tiq-success-card">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="tiq-success-header">
          <div className="tiq-success-icon">{Icons.checkCircle}</div>
          <div>
            <h1>Permohonan terkirim ke tim pajak</h1>
            <p className="tiq-success-meta">
              <code className="tiq-mono">{id}</code>
              <StatusBadge status={result.status || 'pending'} />
            </p>
          </div>
        </div>

        {/* ── Risk banner ───────────────────────────────────── */}
        {result.risk_flagged && (
          <div className="tiq-app-flags">
            <div className="tiq-flag-banner-icon">{Icons.alert}</div>
            <div>
              <div className="tiq-flag-banner-title">
                Permohonan ini memerlukan tinjauan manual
              </div>
              {result.risk_flags?.length > 0 && (
                <ul className="tiq-flag-banner-list">
                  {result.risk_flags.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Submission summary ────────────────────────────── */}
        <div className="tiq-result-summary">
          <div className="tiq-result-row">
            <span className="tiq-result-label">Vendor</span>
            <span className="tiq-result-value tiq-result-vendor">
              <CountryChip country={result.country} />
              {result.vendor_name}
            </span>
          </div>
          <div className="tiq-result-row">
            <span className="tiq-result-label">Jenis penghasilan</span>
            <span className="tiq-result-value">
              {INCOME_LABELS[result.income_type] ?? result.income_type}
            </span>
          </div>
          <div className="tiq-result-row">
            <span className="tiq-result-label">Jumlah transaksi</span>
            <span className="tiq-result-value tiq-mono">{formatIDR(amount)}</span>
          </div>
          <div className="tiq-result-row">
            <span className="tiq-result-label">Dasar hukum</span>
            <span className="tiq-result-value tiq-result-basis">
              {Icons.scales}
              {result.legal_basis || '—'}
            </span>
          </div>
        </div>

        {/* ── Rate comparison ───────────────────────────────── */}
        <div className="tiq-result-rates">
          <div className="tiq-result-rate-box is-domestic">
            <div className="tiq-result-rate-label">Tarif Domestik</div>
            <div className="tiq-result-rate-pct">20%</div>
            <div className="tiq-result-rate-sub">PPh Pasal 26</div>
            <div className="tiq-result-rate-tax tiq-mono">
              {formatIDR(amount * 0.20)}
            </div>
          </div>

          <div className="tiq-result-rate-arrow">{Icons.arrowRight}</div>

          <div className={`tiq-result-rate-box is-treaty ${result.risk_flagged ? 'is-blocked' : ''}`}>
            <div className="tiq-result-rate-label">
              {result.risk_flagged ? 'Tarif Ditangguhkan' : 'Tarif Treaty'}
            </div>
            <div className={`tiq-result-rate-pct ${treatyPct === 0 ? 'is-zero' : ''} ${result.risk_flagged ? 'is-flagged' : ''}`}>
              {result.risk_flagged ? '—' : `${treatyPct}%`}
            </div>
            <div className="tiq-result-rate-sub">
              {result.risk_flagged ? 'Pending tinjauan manual' : (result.legal_basis || 'Treaty rate')}
            </div>
            <div className="tiq-result-rate-tax tiq-mono">
              {result.risk_flagged ? '—' : formatIDR(amount * treatyPct / 100)}
            </div>
          </div>
        </div>

        {/* ── Savings banner ────────────────────────────────── */}
        {!result.risk_flagged && savings > 0 && (
          <div className="tiq-result-savings">
            <span className="tiq-result-savings-label">{Icons.sparkle} Estimasi penghematan pajak</span>
            <span className="tiq-result-savings-val tiq-mono">{formatIDR(savings)}</span>
          </div>
        )}

        {/* ── Next steps ────────────────────────────────────── */}
        <div className="tiq-success-next">
          <div className="tiq-success-next-title">Langkah selanjutnya</div>
          <ol>
            <li>Tim pajak internal akan meninjau permohonan dan dokumen pendukung.</li>
            <li>Anda akan menerima notifikasi saat status berubah.</li>
            <li>
              {result.risk_flagged
                ? 'Jika tinjauan manual disetujui, tarif treaty akan diterapkan secara manual.'
                : `Setelah disetujui, faktur dapat diterbitkan dengan tarif treaty ${treatyPct}%.`}
            </li>
          </ol>
        </div>

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="tiq-success-actions">
          <button className="tiq-btn tiq-btn-ghost" onClick={() => navigate('/dashboard')}>
            {Icons.arrowLeft} Dashboard
          </button>
          {user?.role === 'company_tax_team' && (
            <button className="tiq-btn tiq-btn-primary" onClick={() => navigate('/approval-queue')}>
              Lihat antrean persetujuan {Icons.arrowRight}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
