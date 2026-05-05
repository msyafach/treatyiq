import { useNavigate } from 'react-router-dom'
import { Icons } from '../../components/icons'
import StatusBadge from '../../components/StatusBadge'
import CountryChip from '../../components/CountryChip'
import { formatIDR, INCOME_LABELS } from '../../utils/treatyRates'

export default function StepResult({ result }) {
  const navigate = useNavigate()
  const treatyPct = parseFloat(result.treaty_rate_pct ?? result.treaty_rate * 100)
  const savings = parseFloat(result.tax_savings_idr) || 0
  const id = result.id ? `TIQ-${String(result.id).padStart(6, '0')}` : result.id

  return (
    <div className="tiq-page tiq-wizard-success">
      <div className="tiq-success-card">
        <div className="tiq-success-icon">{Icons.checkCircle}</div>
        <h1>Permohonan terkirim ke tim pajak</h1>
        <p>
          ID Permohonan <code className="tiq-mono">{id}</code> · status:{' '}
          <StatusBadge status={result.status || 'pending'} />
        </p>

        {result.risk_flagged && (
          <div className="tiq-app-flags" style={{ marginTop: 16, textAlign: 'left' }}>
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

        <div className="tiq-success-stats">
          <div>
            <div className="tiq-cell-label">Negara</div>
            <div className="tiq-success-val">
              <CountryChip country={result.country} />
            </div>
          </div>
          <div>
            <div className="tiq-cell-label">Tarif treaty</div>
            <div className="tiq-success-val">
              <span className="tiq-rate-strike">20%</span>
              <span className="tiq-rate-arrow">→</span>
              <span className={`tiq-rate-pill ${treatyPct === 0 ? 'is-zero' : ''}`}>{treatyPct}%</span>
            </div>
          </div>
          <div>
            <div className="tiq-cell-label">Estimasi penghematan</div>
            <div className="tiq-success-val tiq-mono" style={{ color: 'var(--success)' }}>
              {formatIDR(savings)}
            </div>
          </div>
          <div>
            <div className="tiq-cell-label">Estimasi review</div>
            <div className="tiq-success-val">2 hari kerja</div>
          </div>
        </div>

        <div className="tiq-success-next">
          <div className="tiq-success-next-title">Langkah selanjutnya</div>
          <ol>
            <li>Tim pajak internal akan meninjau permohonan dan dokumen pendukung.</li>
            <li>Anda akan menerima notifikasi email saat status berubah.</li>
            <li>
              Setelah disetujui, faktur dapat diterbitkan dengan tarif treaty{' '}
              {treatyPct}%.
            </li>
          </ol>
        </div>

        <div className="tiq-success-actions">
          <button
            className="tiq-btn tiq-btn-ghost"
            onClick={() => navigate('/dashboard')}
          >
            Kembali ke Dashboard
          </button>
          <button
            className="tiq-btn tiq-btn-primary"
            onClick={() => navigate('/approval-queue')}
          >
            Lihat status permohonan
          </button>
        </div>
      </div>
    </div>
  )
}
