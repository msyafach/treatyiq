import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createSubmission } from '../../api/submissions'
import { uploadDocument } from '../../api/documents'
import { Icons } from '../../components/icons'
import CountryChip from '../../components/CountryChip'
import { getTreatyRate, formatIDR, INCOME_LABELS } from '../../utils/treatyRates'
import { useAuth } from '../../context/AuthContext'
import Step1Vendor from './Step1Vendor'
import Step2Income from './Step2Income'
import Step3Compliance from './Step3Compliance'
import Step4Documents from './Step4Documents'
import StepResult from './StepResult'

const STEPS = [
  { key: 'vendor',  label: 'Identitas Vendor',   icon: Icons.briefcase },
  { key: 'income',  label: 'Jenis Penghasilan',  icon: Icons.receipt },
  { key: 'comply',  label: 'Kepatuhan PMK 112',  icon: Icons.shield },
  { key: 'docs',    label: 'Upload Dokumen',      icon: Icons.upload },
]

export default function SubmissionWizard() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({})
  const [files, setFiles] = useState({})
  const [result, setResult] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload) => createSubmission(payload),
    onError: (err) => {
      const detail = err.response?.data
      const msg = typeof detail === 'object'
        ? Object.values(detail).flat().join(' ')
        : 'Gagal mengajukan permohonan'
      toast.error(msg)
    },
  })

  const update = (patch) => setData((d) => ({ ...d, ...patch }))

  const amountNum = parseFloat(String(data.amount_idr || '').replace(/[^\d]/g, '')) || 0
  const treatyInfo = (data.country && data.income_type)
    ? getTreatyRate(data.country, data.income_type)
    : null
  const savings = treatyInfo ? Math.max(0, amountNum * (20 - treatyInfo.rate) / 100) : 0

  const validateStep = () => {
    if (step === 0) {
      if (!data.vendor_name?.trim()) { toast.error('Nama perusahaan vendor wajib diisi'); return false }
      if (!data.foreign_tax_id?.trim()) { toast.error('Nomor pajak asing wajib diisi'); return false }
      if (!data.country) { toast.error('Negara domisili pajak wajib dipilih'); return false }
    }
    if (step === 1) {
      if (!data.income_type) { toast.error('Jenis penghasilan wajib dipilih'); return false }
      const amt = parseFloat(String(data.amount_idr || '').replace(/[^\d]/g, ''))
      if (!amt || amt <= 0) { toast.error('Jumlah penghasilan wajib diisi'); return false }
    }
    if (step === 2) {
      if (data.is_beneficial_owner === undefined || data.is_beneficial_owner === null) {
        toast.error('Pertanyaan Beneficial Owner wajib dijawab'); return false
      }
      if (data.passes_ppt === undefined || data.passes_ppt === null) {
        toast.error('Pertanyaan Principal Purpose Test wajib dijawab'); return false
      }
      if (data.has_economic_substance === undefined || data.has_economic_substance === null) {
        toast.error('Pertanyaan Substansi Ekonomi wajib dijawab'); return false
      }
      if (data.income_type === 'technical_services' &&
          (data.has_permanent_establishment === undefined || data.has_permanent_establishment === null)) {
        toast.error('Pertanyaan Bentuk Usaha Tetap wajib dijawab'); return false
      }
    }
    return true
  }

  const handleNext = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)) }
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    const missing = Step4Documents.validate(data, files)
    if (missing.length > 0) {
      toast.error(`Dokumen wajib belum diunggah: ${missing.join(', ')}`)
      return
    }

    let submission
    try {
      const res = await mutation.mutateAsync({
        vendor_name: data.vendor_name,
        foreign_tax_id: data.foreign_tax_id,
        country: data.country,
        income_type: data.income_type,
        amount_idr: data.amount_idr,
        is_beneficial_owner: data.is_beneficial_owner,
        passes_ppt: data.passes_ppt,
        has_economic_substance: data.has_economic_substance,
        has_permanent_establishment: data.income_type === 'technical_services'
          ? (data.has_permanent_establishment ?? false)
          : null,
      })
      submission = res.data
    } catch {
      return
    }

    const fileEntries = Object.entries(files)
    if (fileEntries.length > 0) {
      setIsUploading(true)
      const uploadToast = toast.loading(`Mengunggah ${fileEntries.length} dokumen...`)
      let failed = 0

      await Promise.allSettled(
        fileEntries.map(async ([docType, file]) => {
          const form = new FormData()
          form.append('submission', submission.id)
          form.append('document_type', docType)
          form.append('file', file)
          try { await uploadDocument(form) } catch { failed++ }
        })
      )

      toast.dismiss(uploadToast)
      setIsUploading(false)

      if (failed === 0) {
        toast.success(`${fileEntries.length} dokumen berhasil diunggah`)
      } else {
        toast.error(`${failed} dokumen gagal diunggah — coba lagi dari Brankas Dokumen`)
      }
    }

    qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    qc.invalidateQueries({ queryKey: ['submissions'] })
    qc.invalidateQueries({ queryKey: ['documents'] })
    setResult(submission)
  }

  if (user?.role === 'company_tax_team') return <Navigate to="/approval-queue" replace />

  if (result) return <StepResult result={result} />

  const isBusy = mutation.isPending || isUploading

  return (
    <div className="tiq-page tiq-wizard">
      <div className="tiq-page-head">
        <div>
          <h1 className="tiq-h1">Ajukan permohonan tarif P3B</h1>
          <p className="tiq-page-sub">Lengkapi 4 langkah · sesuai PMK 112/2025</p>
        </div>
      </div>

      {/* Progress rail */}
      <div className="tiq-stepper">
        {STEPS.map((s, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'pending'
          return (
            <div key={s.key} className={`tiq-step is-${state}`}>
              <div className="tiq-step-marker">
                {state === 'done' ? Icons.check : <span>{i + 1}</span>}
              </div>
              <div className="tiq-step-label">
                <div className="tiq-step-num">Langkah {i + 1}</div>
                <div className="tiq-step-name">{s.label}</div>
              </div>
              {i < STEPS.length - 1 && <div className="tiq-step-line" />}
            </div>
          )
        })}
      </div>

      <div className="tiq-wizard-body">
        {/* Main form area */}
        <div className="tiq-wizard-main">
          {step === 0 && <Step1Vendor data={data} update={update} />}
          {step === 1 && <Step2Income data={data} update={update} />}
          {step === 2 && <Step3Compliance data={data} update={update} />}
          {step === 3 && (
            <Step4Documents data={data} files={files} onFilesChange={setFiles} />
          )}

          <div className="tiq-wizard-nav">
            <button
              className="tiq-btn tiq-btn-ghost"
              onClick={handlePrev}
              disabled={step === 0}
            >
              {Icons.arrowLeft} Kembali
            </button>
            {step < STEPS.length - 1 ? (
              <button className="tiq-btn tiq-btn-primary" onClick={handleNext}>
                Lanjut {Icons.arrowRight}
              </button>
            ) : (
              <button
                className="tiq-btn tiq-btn-success"
                onClick={handleSubmit}
                disabled={isBusy}
              >
                {isBusy ? 'Mengajukan…' : <>{Icons.check} Ajukan permohonan</>}
              </button>
            )}
          </div>
        </div>

        {/* Aside: live treaty estimate */}
        <aside className="tiq-wizard-aside">
          <div className="tiq-aside-card">
            <div className="tiq-aside-eyebrow">Estimasi langsung</div>

            {!data.country ? (
              <div className="tiq-aside-empty">
                <div className="tiq-aside-empty-icon">{Icons.sparkle}</div>
                <p>Pilih negara dan jenis penghasilan untuk melihat tarif treaty serta estimasi penghematan pajak.</p>
              </div>
            ) : (
              <>
                <div className="tiq-aside-vendor">
                  <CountryChip country={data.country} />
                  {data.income_type && (
                    <span className="tiq-aside-income">
                      {INCOME_LABELS[data.income_type]}
                    </span>
                  )}
                </div>

                {treatyInfo && (
                  <>
                    <div className="tiq-aside-rates">
                      <div className="tiq-aside-rate">
                        <div className="tiq-aside-rate-label">Tarif domestik</div>
                        <div className="tiq-aside-rate-value tiq-strike">20%</div>
                      </div>
                      <div className="tiq-aside-rate-arrow">→</div>
                      <div className="tiq-aside-rate is-treaty">
                        <div className="tiq-aside-rate-label">Tarif treaty</div>
                        <div className="tiq-aside-rate-value">{treatyInfo.rate}%</div>
                      </div>
                    </div>

                    {amountNum > 0 && (
                      <>
                        <div className="tiq-aside-row">
                          <span>Pajak terutang</span>
                          <span className="tiq-mono">{formatIDR(amountNum * treatyInfo.rate / 100)}</span>
                        </div>
                        <div className="tiq-aside-row tiq-aside-savings">
                          <span>Anda hemat</span>
                          <span className="tiq-mono">{formatIDR(savings)}</span>
                        </div>
                      </>
                    )}

                    <div className="tiq-aside-basis">
                      <span>{Icons.scales}</span>
                      <span>{treatyInfo.basis}</span>
                    </div>
                  </>
                )}

                {!treatyInfo && data.income_type && (
                  <div className="tiq-aside-empty" style={{ marginTop: 12 }}>
                    <p>Tarif untuk kombinasi ini belum tersedia.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="tiq-aside-help">
            <div className="tiq-aside-help-title">{Icons.shield} Dokumen yang diperlukan</div>
            <ul>
              <li>Certificate of Residence (COR) berlaku 12 bulan</li>
              <li>Form DGT-1 ditandatangani vendor</li>
              <li>Service agreement / kontrak</li>
              {data.income_type?.startsWith('dividends') && (
                <li>Bukti kepemilikan saham 365+ hari</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
