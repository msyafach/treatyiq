import { useState } from 'react'
import { FileUp, Check, AlertCircle } from 'lucide-react'

const REQUIRED_DOCS = {
  all: [
    { id: 'dgt1', label: 'Form DGT-1 (Format baru PMK 112/2025, berlaku 1 Jan 2026)', required: true },
    { id: 'cor', label: 'Certificate of Residence (CoR) — berlaku tahun pajak berjalan', required: true },
  ],
  non_technical: [
    { id: 'beneficial_owner', label: 'Dokumentasi Beneficial Owner', required: true },
  ],
  technical_or_royalty: [
    { id: 'service_agreement', label: 'Service Agreement / Kontrak', required: true },
  ],
  ppt_risk: [
    { id: 'economic_substance', label: 'Bukti Economic Substance (jika PPT berisiko)', required: false },
  ],
}

function getRequiredDocs(data) {
  const docs = [...REQUIRED_DOCS.all]

  if (data.income_type !== 'technical_services') {
    docs.push(...REQUIRED_DOCS.non_technical)
  }
  if (data.income_type === 'technical_services' || data.income_type === 'royalties') {
    docs.push(...REQUIRED_DOCS.technical_or_royalty)
  }
  if (!data.has_economic_substance || !data.passes_ppt) {
    docs.push(...REQUIRED_DOCS.ppt_risk)
  }

  return docs
}

export default function Step4Documents({ data, onSubmit, onBack, isLoading }) {
  const requiredDocs = getRequiredDocs(data)
  const [checkedDocs, setCheckedDocs] = useState({})
  const [fileNames, setFileNames] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const allRequiredChecked = requiredDocs
    .filter(d => d.required)
    .every(d => checkedDocs[d.id])

  const toggleDoc = (id, label) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }))
    if (!checkedDocs[id] && !fileNames[id]) {
      setFileNames(prev => ({ ...prev, [id]: `${label.split('(')[0].trim()}.pdf` }))
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (!allRequiredChecked) return
    onSubmit({})
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-1">Langkah 4: Upload Dokumen</h2>
      <p className="text-sm text-muted mb-5">
        Unggah semua dokumen yang diperlukan sesuai PMK 112/2025. Dokumen tersimpan di brankas digital dan siap untuk audit DJP.
      </p>

      <div className="space-y-3">
        {requiredDocs.map((doc) => {
          const checked = !!checkedDocs[doc.id]
          const missingRequired = submitted && doc.required && !checked
          return (
            <div
              key={doc.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer select-none ${
                checked
                  ? 'border-success bg-success-light'
                  : missingRequired
                  ? 'border-danger bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleDoc(doc.id, doc.label)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center mt-0.5 ${
                    checked ? 'border-success bg-success' : 'border-gray-300'
                  }`}
                >
                  {checked && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${checked ? 'text-green-800' : 'text-gray-800'}`}>
                    {doc.label}
                    {doc.required && <span className="text-danger ml-1">*</span>}
                  </p>
                  {checked && fileNames[doc.id] && (
                    <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                      <FileUp size={11} /> {fileNames[doc.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {submitted && !allRequiredChecked && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          Centang semua dokumen wajib (*) sebelum melanjutkan.
        </div>
      )}

      <p className="text-xs text-muted mt-4">
        * Klik setiap dokumen untuk menandai sebagai sudah diunggah. Upload file aktual akan tersedia setelah permohonan dibuat.
      </p>

      <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
        <button type="button" onClick={onBack} className="btn-secondary" disabled={isLoading}>
          ← Kembali
        </button>
        <button onClick={handleSubmit} className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Mengajukan...' : 'Submit untuk Persetujuan'}
        </button>
      </div>
    </div>
  )
}
