import { useRef, useState } from 'react'
import { FileUp, X, AlertCircle, Paperclip } from 'lucide-react'

const ALL_DOCS = [
  { id: 'dgt1', label: 'Form DGT-1', description: 'Format baru PMK 112/2025 (berlaku 1 Jan 2026)', required: true, always: true },
  { id: 'cor', label: 'Certificate of Residence (CoR)', description: 'Berlaku untuk tahun pajak berjalan', required: true, always: true },
  { id: 'service_agreement', label: 'Service Agreement / Kontrak', description: 'Perjanjian jasa atau kontrak kerja', required: true, for: ['technical_services', 'royalties'] },
  { id: 'beneficial_owner', label: 'Dokumentasi Beneficial Owner', description: 'Bukti kepemilikan manfaat atas penghasilan', required: true, excludeFor: ['technical_services'] },
  { id: 'economic_substance', label: 'Bukti Economic Substance', description: 'Diperlukan jika ada risiko PPT atau substansi ekonomi dipertanyakan', required: false, ifRisk: true },
]

function getDocList(data) {
  const hasPptRisk = !data.has_economic_substance || !data.passes_ppt
  return ALL_DOCS.filter((doc) => {
    if (!doc.always) {
      if (doc.for && !doc.for.includes(data.income_type)) return false
      if (doc.excludeFor && doc.excludeFor.includes(data.income_type)) return false
      if (doc.ifRisk && !hasPptRisk) return false
    }
    return true
  })
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Step4Documents({ data, onSubmit, onBack, isLoading }) {
  const docList = getDocList(data)
  const [files, setFiles] = useState({})
  const [attempted, setAttempted] = useState(false)
  const inputRefs = useRef({})

  const requiredMissing = docList
    .filter((d) => d.required && !files[d.id])
    .map((d) => d.label)

  const handleFileChange = (docId, e) => {
    const file = e.target.files[0]
    if (!file) return
    setFiles((prev) => ({ ...prev, [docId]: file }))
  }

  const removeFile = (docId) => {
    setFiles((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
    if (inputRefs.current[docId]) {
      inputRefs.current[docId].value = ''
    }
  }

  const handleSubmit = () => {
    setAttempted(true)
    if (requiredMissing.length > 0) return
    onSubmit(files)
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-1">Langkah 4: Upload Dokumen</h2>
      <p className="text-sm text-muted mb-5">
        Unggah semua dokumen sesuai PMK 112/2025. File tersimpan di Brankas Dokumen digital dan siap untuk pemeriksaan DJP.
      </p>

      <div className="space-y-3">
        {docList.map((doc) => {
          const file = files[doc.id]
          const missing = attempted && doc.required && !file

          return (
            <div
              key={doc.id}
              className={`rounded-lg border-2 p-4 transition-colors ${
                file
                  ? 'border-success bg-success-light'
                  : missing
                  ? 'border-danger bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Paperclip
                  size={16}
                  className={`flex-shrink-0 mt-0.5 ${file ? 'text-success' : missing ? 'text-danger' : 'text-muted'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {doc.label}
                    {doc.required && <span className="text-danger ml-1">*</span>}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{doc.description}</p>

                  {file ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-green-800 bg-white border border-green-300 rounded px-2 py-0.5 font-mono truncate max-w-[220px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted">{formatFileSize(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(doc.id)}
                        className="text-muted hover:text-danger transition-colors"
                        title="Hapus file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRefs.current[doc.id]?.click()}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium"
                    >
                      <FileUp size={13} />
                      Pilih File
                    </button>
                  )}

                  <input
                    ref={(el) => { inputRefs.current[doc.id] = el }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    onChange={(e) => handleFileChange(doc.id, e)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {attempted && requiredMissing.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Dokumen wajib belum diunggah:</p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
              {requiredMissing.map((label) => <li key={label}>{label}</li>)}
            </ul>
          </div>
        </div>
      )}

      <p className="text-xs text-muted mt-4">
        Format yang diterima: PDF, Word, Excel, JPEG, PNG (maks. 10 MB per file)
      </p>

      <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
        <button type="button" onClick={onBack} className="btn-secondary" disabled={isLoading}>
          ← Kembali
        </button>
        <button onClick={handleSubmit} className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Mengajukan...
            </span>
          ) : 'Submit untuk Persetujuan'}
        </button>
      </div>
    </div>
  )
}
