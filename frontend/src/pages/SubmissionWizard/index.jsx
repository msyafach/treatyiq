import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { createSubmission } from '../../api/submissions'
import Step1Vendor from './Step1Vendor'
import Step2Income from './Step2Income'
import Step3Compliance from './Step3Compliance'
import Step4Documents from './Step4Documents'
import StepResult from './StepResult'

const STEPS = [
  'Identitas Vendor',
  'Jenis Penghasilan',
  'Kepatuhan PMK 112',
  'Upload Dokumen',
]

export default function SubmissionWizard() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [result, setResult] = useState(null)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => createSubmission(data),
    onSuccess: ({ data }) => {
      setResult(data)
      setStep(4)
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
    },
    onError: (err) => {
      const detail = err.response?.data
      if (typeof detail === 'object') {
        const msg = Object.values(detail).flat().join(' ')
        toast.error(msg || 'Gagal mengajukan permohonan')
      } else {
        toast.error('Gagal mengajukan permohonan')
      }
    },
  })

  const updateData = (newData) => setFormData((prev) => ({ ...prev, ...newData }))

  const next = (data) => {
    updateData(data)
    setStep((s) => s + 1)
  }

  const prev = () => setStep((s) => s - 1)

  const submit = (docData) => {
    const payload = { ...formData, ...docData }
    mutation.mutate(payload)
  }

  if (step === 4 && result) {
    return <StepResult result={result} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Ajukan Permohonan P3B</h1>
        <p className="text-sm text-muted mt-0.5">Lengkapi formulir sesuai PMK 112/2025</p>
      </div>

      {/* Progress */}
      <div className="card p-5 mb-6">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < step
                      ? 'bg-success text-white'
                      : i === step
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-muted'
                  }`}
                >
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className={`text-[11px] mt-1 text-center max-w-[70px] leading-tight ${
                  i === step ? 'text-primary font-medium' : 'text-muted'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-success' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 0 && <Step1Vendor data={formData} onNext={next} />}
      {step === 1 && <Step2Income data={formData} onNext={next} onBack={prev} />}
      {step === 2 && <Step3Compliance data={formData} onNext={next} onBack={prev} />}
      {step === 3 && (
        <Step4Documents
          data={formData}
          onSubmit={submit}
          onBack={prev}
          isLoading={mutation.isPending}
        />
      )}
    </div>
  )
}
