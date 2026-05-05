import { Icons } from '../../components/icons'

const CHECKS = [
  {
    key: 'has_cor',
    label: 'COR (Certificate of Residence)',
    desc: 'Diterbitkan otoritas pajak negara domisili, valid maksimum 12 bulan.',
  },
  {
    key: 'has_dgt1',
    label: 'Form DGT-1',
    desc: 'Form deklarasi vendor, ditandatangani basah atau e-signed.',
  },
  {
    key: 'has_msa',
    label: 'Kontrak / service agreement',
    desc: 'Bukti hubungan bisnis substantif antara vendor dan pemberi penghasilan.',
  },
  {
    key: 'has_bo',
    label: 'Beneficial owner declaration',
    desc: 'Wajib jika penghasilan berupa dividen, royalti, atau bunga.',
  },
]

export default function Step3Compliance({ data, update }) {
  return (
    <div className="tiq-card tiq-step-card">
      <div className="tiq-step-card-head">
        <h2>Kepatuhan PMK 112/2025</h2>
        <p>Konfirmasi vendor memenuhi syarat administratif sebelum tarif treaty diterapkan.</p>
      </div>

      <div className="tiq-check-list">
        {CHECKS.map((c) => (
          <label
            key={c.key}
            className={`tiq-check ${data[c.key] ? 'is-checked' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!data[c.key]}
              onChange={(e) => update({ [c.key]: e.target.checked })}
            />
            <span className="tiq-check-box">{Icons.check}</span>
            <div className="tiq-check-content">
              <div className="tiq-check-label">{c.label}</div>
              <div className="tiq-check-desc">{c.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="tiq-ppt">
        <div className="tiq-ppt-head">
          <span className="tiq-ppt-icon">{Icons.scales}</span>
          <div>
            <div className="tiq-ppt-title">Principal Purpose Test (PPT)</div>
            <div className="tiq-ppt-sub">
              Apakah tujuan utama transaksi <em>bukan</em> semata-mata untuk memperoleh manfaat treaty?
            </div>
          </div>
        </div>
        <div className="tiq-ppt-options">
          <button
            type="button"
            className={`tiq-ppt-opt ${data.ppt_passed === true ? 'is-yes' : ''}`}
            onClick={() => update({ ppt_passed: true })}
          >
            {Icons.check} Ya, ada substansi bisnis nyata
          </button>
          <button
            type="button"
            className={`tiq-ppt-opt ${data.ppt_passed === false ? 'is-no' : ''}`}
            onClick={() => update({ ppt_passed: false })}
          >
            {Icons.alert} Tidak yakin / butuh tinjauan
          </button>
        </div>
      </div>
    </div>
  )
}
