import { useForm } from 'react-hook-form'
import { COUNTRIES } from '../../utils/treatyRates'

export default function Step1Vendor({ data, onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      vendor_name: data.vendor_name || '',
      foreign_tax_id: data.foreign_tax_id || '',
      country: data.country || '',
    },
  })

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Langkah 1: Identitas Vendor</h2>
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <label className="label">Nama Perusahaan Vendor <span className="text-danger">*</span></label>
          <input
            className="input-field"
            placeholder="Contoh: RSM Singapore Pte Ltd"
            {...register('vendor_name', { required: 'Nama vendor wajib diisi' })}
          />
          {errors.vendor_name && <p className="text-xs text-danger mt-1">{errors.vendor_name.message}</p>}
        </div>

        <div>
          <label className="label">Nomor Pajak Asing (Tax ID / NPWP Luar Negeri) <span className="text-danger">*</span></label>
          <input
            className="input-field"
            placeholder="Contoh: SG-201234567A"
            {...register('foreign_tax_id', { required: 'Nomor pajak wajib diisi' })}
          />
          {errors.foreign_tax_id && <p className="text-xs text-danger mt-1">{errors.foreign_tax_id.message}</p>}
        </div>

        <div>
          <label className="label">Negara Domisili Pajak <span className="text-danger">*</span></label>
          <select
            className="input-field"
            {...register('country', { required: 'Negara wajib dipilih' })}
          >
            <option value="">— Pilih Negara —</option>
            {COUNTRIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {errors.country && <p className="text-xs text-danger mt-1">{errors.country.message}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary">
            Lanjut →
          </button>
        </div>
      </form>
    </div>
  )
}
