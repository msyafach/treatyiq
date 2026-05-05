import { COUNTRY_MAP } from '../../components/CountryChip'

const WIZARD_COUNTRIES = ['singapore', 'japan', 'netherlands', 'usa', 'australia'].map(
  (key) => ({ key, ...COUNTRY_MAP[key] })
).concat({ key: 'other', flag: '🌍', label: 'Negara Lainnya', code: '···' })

export default function Step1Vendor({ data, update }) {
  return (
    <div className="tiq-card tiq-step-card">
      <div className="tiq-step-card-head">
        <h2>Identitas vendor</h2>
        <p>Data perusahaan vendor luar negeri yang menerima penghasilan dari Indonesia.</p>
      </div>

      <div className="tiq-form-grid">
        <div className="tiq-field">
          <label className="tiq-label">
            Nama perusahaan vendor <span className="tiq-req">*</span>
          </label>
          <input
            className="tiq-input"
            placeholder="Contoh: RSM Singapore Pte Ltd"
            value={data.vendor_name || ''}
            onChange={(e) => update({ vendor_name: e.target.value })}
          />
        </div>

        <div className="tiq-field">
          <label className="tiq-label">
            Nomor pajak asing (Tax ID) <span className="tiq-req">*</span>
          </label>
          <input
            className="tiq-input tiq-mono"
            placeholder="SG-201234567A"
            value={data.foreign_tax_id || ''}
            onChange={(e) => update({ foreign_tax_id: e.target.value })}
          />
          <div className="tiq-field-hint">Format mengikuti negara domisili</div>
        </div>

        <div className="tiq-field is-full">
          <label className="tiq-label">
            Negara domisili pajak <span className="tiq-req">*</span>
          </label>
          <div className="tiq-country-grid">
            {WIZARD_COUNTRIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`tiq-country-tile ${data.country === c.key ? 'is-active' : ''}`}
                onClick={() => update({ country: c.key })}
              >
                <span className="tiq-country-tile-flag">{c.flag}</span>
                <span className="tiq-country-tile-label">{c.label}</span>
                <span className="tiq-country-tile-code">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
