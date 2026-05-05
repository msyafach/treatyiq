import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Icons } from '../../components/icons'

const ALL_DOCS = [
  { id: 'dgt1',             label: 'Form DGT-1',                    required: true,  always: true },
  { id: 'cor',              label: 'Certificate of Residence (CoR)', required: true,  always: true },
  { id: 'service_agreement', label: 'Service Agreement / Kontrak',  required: true,  for: ['technical_services', 'royalties'] },
  { id: 'beneficial_owner', label: 'Beneficial Owner Declaration',  required: true,  excludeFor: ['technical_services'] },
  { id: 'economic_substance', label: 'Bukti Economic Substance',    required: false, ifRisk: true },
]

function getDocList(data) {
  const hasPptRisk = !data.has_economic_substance || data.passes_ppt === false
  return ALL_DOCS.filter((doc) => {
    if (!doc.always) {
      if (doc.for && !doc.for.includes(data.income_type)) return false
      if (doc.excludeFor && doc.excludeFor.includes(data.income_type)) return false
      if (doc.ifRisk && !hasPptRisk) return false
    }
    return true
  })
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function Step4Documents({ data, files, onFilesChange }) {
  const docList = getDocList(data)
  const [attempted, setAttempted] = useState(false)
  const inputRefs = useRef({})

  const setFile = (id, file) => {
    onFilesChange({ ...files, [id]: file || undefined })
  }

  const MAX_SIZE = 10 * 1024 * 1024
  const handleChange = (id, e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name} melebihi batas ukuran 10 MB`)
      e.target.value = ''
      return
    }
    setFile(id, file)
  }

  const remove = (id) => {
    const next = { ...files }
    delete next[id]
    onFilesChange(next)
    if (inputRefs.current[id]) inputRefs.current[id].value = ''
  }

  return (
    <div className="tiq-card tiq-step-card">
      <div className="tiq-step-card-head">
        <h2>Unggah dokumen pendukung</h2>
        <p>PDF, maksimum 10 MB per berkas. Semua dokumen disimpan di brankas siap audit DJP.</p>
      </div>

      <div className="tiq-upload-list">
        {docList.map((doc) => {
          const file = files[doc.id]
          const missing = attempted && doc.required && !file
          return (
            <div
              key={doc.id}
              className={`tiq-upload-row ${file ? 'is-uploaded' : ''} ${missing ? 'is-error' : ''}`}
            >
              <div className="tiq-upload-icon">
                {file ? Icons.checkCircle : Icons.doc}
              </div>
              <div className="tiq-upload-meta">
                <div className="tiq-upload-name">
                  {doc.label}
                  {doc.required && <span className="tiq-req">*</span>}
                </div>
                <div className="tiq-upload-detail">
                  {file
                    ? `${file.name} · ${fmtSize(file.size)} · diunggah baru saja`
                    : 'Belum diunggah · PDF, maks. 10 MB'}
                </div>
              </div>
              {file ? (
                <button
                  type="button"
                  className="tiq-btn tiq-btn-ghost tiq-btn-sm"
                  onClick={() => remove(doc.id)}
                >
                  Ganti
                </button>
              ) : (
                <button
                  type="button"
                  className="tiq-btn tiq-btn-primary tiq-btn-sm"
                  onClick={() => inputRefs.current[doc.id]?.click()}
                >
                  {Icons.upload} Pilih berkas
                </button>
              )}
              <input
                ref={(el) => { inputRefs.current[doc.id] = el }}
                type="file"
                className="tiq-file-hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleChange(doc.id, e)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

Step4Documents.validate = (data, files) => {
  const docList = getDocList(data)
  return docList.filter((d) => d.required && !files[d.id]).map((d) => d.label)
}
