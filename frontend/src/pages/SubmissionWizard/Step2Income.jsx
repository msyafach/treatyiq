import { Icons } from '../../components/icons'
import { INCOME_TYPES, getTreatyRate } from '../../utils/treatyRates'

const INCOME_ICONS = {
  technical_services:  Icons.briefcase,
  royalties:           Icons.sparkle,
  dividends_general:   Icons.trending,
  dividends_qualified: Icons.trending,
  interest:            Icons.hash,
}

export default function Step2Income({ data, update }) {
  const formatRaw = (val) => String(val || '').replace(/[^\d]/g, '')

  return (
    <div className="tiq-card tiq-step-card">
      <div className="tiq-step-card-head">
        <h2>Jenis penghasilan &amp; jumlah</h2>
        <p>Pilih jenis penghasilan untuk mendapatkan tarif treaty yang berlaku.</p>
      </div>

      <div className="tiq-field is-full">
        <label className="tiq-label">
          Jenis penghasilan <span className="tiq-req">*</span>
        </label>
        <div className="tiq-income-grid">
          {INCOME_TYPES.map((t) => {
            const active = data.income_type === t.value
            const info = data.country ? getTreatyRate(data.country, t.value) : null
            return (
              <button
                key={t.value}
                type="button"
                className={`tiq-income-tile ${active ? 'is-active' : ''}`}
                onClick={() => update({ income_type: t.value })}
              >
                <span className="tiq-income-icon">{INCOME_ICONS[t.value]}</span>
                <div className="tiq-income-content">
                  <div className="tiq-income-label">{t.label}</div>
                  <div className="tiq-income-desc">{t.description}</div>
                </div>
                {info != null && (
                  <span className={`tiq-rate-pill ${info.rate === 0 ? 'is-zero' : ''}`}>
                    {info.rate}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="tiq-field is-full">
        <label className="tiq-label">
          Jumlah penghasilan (IDR) <span className="tiq-req">*</span>
        </label>
        <div className="tiq-input-wrap">
          <span className="tiq-input-leading tiq-input-prefix">Rp</span>
          <input
            className="tiq-input tiq-input-leading-pad tiq-mono"
            type="text"
            placeholder="0"
            value={data.amount_idr || ''}
            onChange={(e) => update({ amount_idr: formatRaw(e.target.value) })}
          />
        </div>
        {data.amount_idr && (
          <div className="tiq-amount-words">
            ≈ Rp {Number(data.amount_idr).toLocaleString('id-ID')}
          </div>
        )}
      </div>
    </div>
  )
}
