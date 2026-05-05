import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

const QUESTIONS = [
  {
    id: 'is_beneficial_owner',
    text: 'Apakah vendor adalah penerima manfaat sebenarnya (beneficial owner) dari penghasilan ini — bukan agen, nominee, atau conduit?',
    riskOnNo: true,
    riskMsg: 'Vendor bukan beneficial owner',
    alwaysShow: true,
  },
  {
    id: 'passes_ppt',
    text: 'Apakah tujuan utama transaksi ini BUKAN semata-mata untuk memperoleh manfaat tax treaty? (Uji Tujuan Utama / Principal Purpose Test — PMK 112 Pasal 18)',
    riskOnNo: true,
    riskMsg: 'Gagal Principal Purpose Test',
    alwaysShow: true,
  },
  {
    id: 'has_economic_substance',
    text: 'Apakah vendor memiliki substansi ekonomi nyata di negara domisilinya — karyawan, kantor, bisnis aktif?',
    riskOnNo: true,
    riskMsg: 'Tidak memiliki substansi ekonomi',
    alwaysShow: true,
  },
  {
    id: 'has_permanent_establishment',
    text: 'Apakah vendor memiliki Bentuk Usaha Tetap (BUT) di Indonesia?',
    riskOnYes: true,
    riskMsg: 'Vendor memiliki BUT di Indonesia',
    onlyFor: ['technical_services'],
  },
]

function RadioGroup({ value, onChange }) {
  return (
    <div className="flex gap-4 mt-2">
      {[
        { val: 'true', label: 'Ya' },
        { val: 'false', label: 'Tidak' },
      ].map(({ val, label }) => (
        <label key={val} className="flex items-center gap-2 cursor-pointer select-none">
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              value === val ? 'border-primary' : 'border-gray-300'
            }`}
            onClick={() => onChange(val)}
          >
            {value === val && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <span className="text-sm">{label}</span>
        </label>
      ))}
    </div>
  )
}

export default function Step3Compliance({ data, onNext, onBack }) {
  const [answers, setAnswers] = useState({
    is_beneficial_owner: data.is_beneficial_owner !== undefined ? String(data.is_beneficial_owner) : '',
    passes_ppt: data.passes_ppt !== undefined ? String(data.passes_ppt) : '',
    has_economic_substance: data.has_economic_substance !== undefined ? String(data.has_economic_substance) : '',
    has_permanent_establishment: data.has_permanent_establishment !== undefined ? String(data.has_permanent_establishment) : '',
  })
  const [submitted, setSubmitted] = useState(false)

  const visibleQuestions = QUESTIONS.filter(q =>
    q.alwaysShow || (q.onlyFor && q.onlyFor.includes(data.income_type))
  )

  const riskFlags = visibleQuestions.filter(q => {
    const ans = answers[q.id]
    if (q.riskOnNo && ans === 'false') return true
    if (q.riskOnYes && ans === 'true') return true
    return false
  })

  const allAnswered = visibleQuestions.every(q => answers[q.id] !== '')

  const handleSubmit = () => {
    setSubmitted(true)
    if (!allAnswered) return

    const payload = {
      is_beneficial_owner: answers.is_beneficial_owner === 'true',
      passes_ppt: answers.passes_ppt === 'true',
      has_economic_substance: answers.has_economic_substance === 'true',
    }
    if (data.income_type === 'technical_services') {
      payload.has_permanent_establishment = answers.has_permanent_establishment === 'true'
    }
    onNext(payload)
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-1">Langkah 3: Pertanyaan Kepatuhan PMK 112/2025</h2>
      <p className="text-sm text-muted mb-5">
        Jawab semua pertanyaan dengan jujur. Jawaban yang tidak sesuai dapat mengakibatkan pengenaan tarif domestik.
      </p>

      <div className="space-y-5">
        {visibleQuestions.map((q, i) => {
          const ans = answers[q.id]
          const isRisky = (q.riskOnNo && ans === 'false') || (q.riskOnYes && ans === 'true')
          return (
            <div
              key={q.id}
              className={`p-4 rounded-lg border ${isRisky ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
            >
              <p className="text-sm font-medium text-gray-800">
                <span className="text-primary font-bold mr-1">{i + 1}.</span>
                {q.text}
              </p>
              <RadioGroup
                value={ans}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
              />
              {isRisky && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                  <AlertTriangle size={12} /> Risiko: {q.riskMsg}
                </p>
              )}
              {submitted && ans === '' && (
                <p className="text-xs text-danger mt-1">Pertanyaan ini wajib dijawab</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Risk summary */}
      {riskFlags.length > 0 ? (
        <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-300">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Permohonan Ini Memerlukan Tinjauan Manual</p>
              <p className="text-xs text-red-600 mt-1">
                Tarif P3B tidak dapat diterapkan secara otomatis. Permohonan akan ditandai untuk tinjauan substantif oleh Tim Pajak.
              </p>
              <ul className="mt-2 space-y-0.5">
                {riskFlags.map((q) => (
                  <li key={q.id} className="text-xs text-red-700 flex items-center gap-1">
                    <span>•</span> {q.riskMsg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : allAnswered ? (
        <div className="mt-5 p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-success" />
            <p className="text-sm font-medium text-green-800">Vendor memenuhi syarat kepatuhan PMK 112/2025</p>
          </div>
        </div>
      ) : null}

      <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
        <button type="button" onClick={onBack} className="btn-secondary">← Kembali</button>
        <button onClick={handleSubmit} className="btn-primary">Lanjut →</button>
      </div>
    </div>
  )
}
