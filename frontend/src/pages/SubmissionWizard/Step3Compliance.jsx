import { Icons } from '../../components/icons'

const QUESTIONS = [
  {
    key: 'is_beneficial_owner',
    label: 'Beneficial Owner',
    question:
      'Apakah vendor adalah penerima manfaat sesungguhnya (beneficial owner) dari penghasilan ini — bukan agen, nominee, atau conduit?',
    yesLabel: 'Ya, vendor adalah beneficial owner',
    noLabel: 'Tidak / Tidak yakin',
    flagOnNo: true,
    flagReason: 'Vendor bukan beneficial owner dari penghasilan ini',
  },
  {
    key: 'passes_ppt',
    label: 'Principal Purpose Test (PMK 112 Pasal 18)',
    question:
      'Apakah tujuan utama transaksi ini BUKAN semata-mata untuk memperoleh manfaat treaty? (Principal Purpose Test)',
    yesLabel: 'Ya, ada substansi bisnis nyata selain manfaat treaty',
    noLabel: 'Tidak / Tujuan utama adalah manfaat treaty',
    flagOnNo: true,
    flagReason: 'Gagal Uji Tujuan Utama / Principal Purpose Test (PMK 112 Pasal 18)',
  },
  {
    key: 'has_economic_substance',
    label: 'Substansi Ekonomi',
    question:
      'Apakah vendor memiliki substansi ekonomi nyata di negara domisilinya — karyawan, kantor, bisnis aktif?',
    yesLabel: 'Ya, vendor memiliki substansi ekonomi nyata',
    noLabel: 'Tidak / Tidak yakin',
    flagOnNo: true,
    flagReason: 'Vendor tidak memiliki substansi ekonomi nyata di negara domisilinya',
  },
]

const PE_QUESTION = {
  key: 'has_permanent_establishment',
  label: 'Bentuk Usaha Tetap (BUT)',
  question:
    'Apakah vendor memiliki Bentuk Usaha Tetap (BUT) di Indonesia?',
  yesLabel: 'Ya, vendor memiliki BUT di Indonesia',
  noLabel: 'Tidak',
  flagOnYes: true,
  flagReason: 'Vendor memiliki Bentuk Usaha Tetap (BUT) di Indonesia',
}

function RadioQuestion({ q, value, onChange }) {
  const answered = value !== undefined && value !== null
  const willFlag = answered && (
    (q.flagOnNo  && value === false) ||
    (q.flagOnYes && value === true)
  )

  return (
    <div className={`tiq-compliance-q ${willFlag ? 'is-flagged' : ''} ${answered ? 'is-answered' : ''}`}>
      <div className="tiq-compliance-q-label">{q.label}</div>
      <div className="tiq-compliance-q-text">{q.question}</div>
      <div className="tiq-compliance-opts">
        <button
          type="button"
          className={`tiq-compliance-opt is-yes ${value === true ? 'is-selected' : ''}`}
          onClick={() => onChange(true)}
        >
          {Icons.check}
          <span>{q.yesLabel}</span>
        </button>
        <button
          type="button"
          className={`tiq-compliance-opt is-no ${value === false ? 'is-selected' : ''}`}
          onClick={() => onChange(false)}
        >
          {Icons.alert}
          <span>{q.noLabel}</span>
        </button>
      </div>
      {willFlag && (
        <div className="tiq-compliance-flag-hint">
          {Icons.alert} Jawaban ini akan menandai permohonan untuk tinjauan manual.
        </div>
      )}
    </div>
  )
}

export default function Step3Compliance({ data, update }) {
  const isTechnicalServices = data.income_type === 'technical_services'

  const activeFlags = [
    data.is_beneficial_owner === false && 'Vendor bukan beneficial owner',
    data.passes_ppt === false && 'Gagal Principal Purpose Test',
    data.has_economic_substance === false && 'Tidak ada substansi ekonomi',
    isTechnicalServices && data.has_permanent_establishment === true && 'Vendor memiliki BUT di Indonesia',
  ].filter(Boolean)

  return (
    <div className="tiq-card tiq-step-card">
      <div className="tiq-step-card-head">
        <h2>Kepatuhan PMK 112/2025</h2>
        <p>
          Jawab 4 pertanyaan berikut. Jika ada jawaban yang memicu risiko,
          permohonan akan ditandai untuk <strong>tinjauan manual</strong> dan
          tarif treaty tidak diterapkan otomatis.
        </p>
      </div>

      <div className="tiq-compliance-list">
        {QUESTIONS.map((q) => (
          <RadioQuestion
            key={q.key}
            q={q}
            value={data[q.key]}
            onChange={(v) => update({ [q.key]: v })}
          />
        ))}

        {isTechnicalServices && (
          <RadioQuestion
            q={PE_QUESTION}
            value={data.has_permanent_establishment}
            onChange={(v) => update({ has_permanent_establishment: v })}
          />
        )}
      </div>

      {activeFlags.length > 0 && (
        <div className="tiq-compliance-risk-banner">
          <div className="tiq-compliance-risk-title">
            {Icons.alert} Permohonan akan ditandai — Tinjauan Manual Diperlukan
          </div>
          <ul className="tiq-compliance-risk-list">
            {activeFlags.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
