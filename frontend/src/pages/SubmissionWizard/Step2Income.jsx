import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { INCOME_TYPES, getTreatyRate, calculateTaxSavings, formatIDR, DOMESTIC_RATE } from '../../utils/treatyRates'

export default function Step2Income({ data, onNext, onBack }) {
  const [selectedType, setSelectedType] = useState(data.income_type || '')
  const [amount, setAmount] = useState(data.amount_idr || '')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      income_type: data.income_type || '',
      amount_idr: data.amount_idr || '',
    },
  })

  const treatyInfo = data.country && selectedType ? getTreatyRate(data.country, selectedType) : null
  const parsedAmount = parseFloat(String(amount).replace(/\D/g, '')) || 0
  const savings = treatyInfo ? calculateTaxSavings(parsedAmount, treatyInfo.rate) : 0

  const onSubmit = (values) => {
    onNext({ ...values, income_type: selectedType })
  }

  const selectType = (val) => {
    setSelectedType(val)
    setValue('income_type', val)
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Langkah 2: Jenis Penghasilan & Jumlah</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label mb-2">Jenis Penghasilan <span className="text-danger">*</span></label>
          <input type="hidden" {...register('income_type', { required: true })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCOME_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => selectType(type.value)}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  selectedType === type.value
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{type.icon}</span>
                  <div>
                    <div className={`text-sm font-medium ${selectedType === type.value ? 'text-primary' : 'text-gray-900'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.income_type && <p className="text-xs text-danger mt-1">Jenis penghasilan wajib dipilih</p>}
        </div>

        <div>
          <label className="label">Jumlah (IDR) <span className="text-danger">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">Rp</span>
            <input
              type="number"
              className="input-field pl-10"
              placeholder="0"
              min="0"
              {...register('amount_idr', {
                required: 'Jumlah wajib diisi',
                min: { value: 1, message: 'Jumlah harus lebih dari 0' },
              })}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {errors.amount_idr && <p className="text-xs text-danger mt-1">{errors.amount_idr.message}</p>}
        </div>

        {/* Live preview */}
        {treatyInfo && parsedAmount > 0 && (
          <div className="rounded-lg border-2 border-primary bg-primary-light p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Estimasi Penghematan Pajak</h3>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <div className="text-xs text-muted">Tarif Domestik</div>
                <div className="text-xl font-bold text-gray-700">{DOMESTIC_RATE}%</div>
              </div>
              <div className="flex items-center justify-center text-2xl text-muted">→</div>
              <div>
                <div className="text-xs text-muted">Tarif P3B</div>
                <div className="text-xl font-bold text-success">{treatyInfo.rate}%</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-xs text-muted">Estimasi Penghematan</div>
              <div className="text-lg font-bold text-success">{formatIDR(savings)}</div>
            </div>
            <div className="text-xs text-muted text-center mt-2">{treatyInfo.basis}</div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="btn-secondary">← Kembali</button>
          <button type="submit" className="btn-primary">Lanjut →</button>
        </div>
      </form>
    </div>
  )
}
