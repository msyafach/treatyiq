import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Selamat datang, ${user.full_name}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Email atau kata sandi salah.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0095D6 0%, #0077B0 100%)' }}>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white/20 rounded-xl p-3">
            <Shield size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">TreatyIQ</h1>
            <p className="text-white/70 text-sm">Portal Kepatuhan Pajak P3B</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">
          Kepatuhan PMK 112/2025<br />lebih mudah dan terdokumentasi
        </h2>
        <ul className="space-y-3 text-white/80 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-300">✓</span>
            Kalkulasi tarif P3B otomatis berdasarkan negara & jenis penghasilan
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-300">✓</span>
            Uji Principal Purpose Test (PPT) terintegrasi
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-300">✓</span>
            Brankas dokumen digital siap audit DJP
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-300">✓</span>
            Alur persetujuan tim pajak internal
          </li>
        </ul>
        <div className="mt-8 p-4 bg-white/10 rounded-xl text-xs text-white/60">
          <strong className="text-white/80">Akun Demo:</strong>
          <div className="mt-1">Tim Pajak: pajak@bni.co.id / TreatyIQ@2026</div>
          <div>Vendor: tax@rsm.sg / TreatyIQ@2026</div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Shield size={28} className="text-primary" />
            <span className="text-xl font-bold text-primary">TreatyIQ</span>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Masuk ke Akun</h2>
            <p className="text-sm text-muted mb-6">Portal Kepatuhan PMK 112/2025</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="nama@perusahaan.com"
                  {...register('email', { required: 'Email wajib diisi' })}
                />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    {...register('password', { required: 'Kata sandi wajib diisi' })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            Berlaku sesuai PMK 112/2025 — efektif 1 Januari 2026
          </p>
        </div>
      </div>
    </div>
  )
}
