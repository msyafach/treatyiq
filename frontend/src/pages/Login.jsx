import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Icons } from '../components/icons'

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
    <div className="tiq-login">
      {/* Left brand panel */}
      <div className="tiq-login-brand">
        <div className="tiq-login-brand-bg" />
        <div className="tiq-login-brand-inner">
          <div className="tiq-login-logo">
            <img
              src="/rsm-logo.svg"
              alt="RSM"
              style={{ height: 48 }}
            />
          </div>
          <div className="tiq-login-eyebrow">Portal Kepatuhan PMK 112/2025</div>
          <h1 className="tiq-login-headline">
            Tarif P3B yang <span className="tiq-headline-accent">benar</span>,<br />
            audit yang <span className="tiq-headline-accent">tenang</span>.
          </h1>
          <p className="tiq-login-sub">
            Kalkulasi tarif treaty otomatis, uji PPT terintegrasi, dan brankas dokumen
            siap diserahkan ke DJP — semua dalam satu alur kerja.
          </p>

          <div className="tiq-login-bullets">
            {[
              'Kalkulasi tarif treaty otomatis untuk 60+ negara mitra',
              'Uji Principal Purpose Test (PPT) terintegrasi',
              'Brankas dokumen digital siap audit DJP',
              'Alur persetujuan tim pajak internal',
            ].map((t) => (
              <div key={t} className="tiq-login-bullet">
                <span className="tiq-login-check">✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Right form */}
      <div className="tiq-login-form-wrap">
        <form className="tiq-login-form" onSubmit={handleSubmit(onSubmit)}>
          <h2>Masuk ke akun</h2>
          <p className="tiq-login-form-sub">Lanjutkan ke dashboard kepatuhan P3B Anda.</p>

          <div style={{ marginBottom: 18 }}>
            <label className="tiq-label">Email kerja</label>
            <input
              className="tiq-input"
              type="email"
              placeholder="nama@perusahaan.com"
              {...register('email', { required: 'Email wajib diisi' })}
            />
            {errors.email && (
              <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="tiq-row-between" style={{ marginBottom: 7 }}>
              <label className="tiq-label" style={{ margin: 0 }}>Kata sandi</label>
              <a className="tiq-link" href="#">Lupa kata sandi?</a>
            </div>
            <div className="tiq-input-wrap">
              <input
                className="tiq-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
                {...register('password', { required: 'Kata sandi wajib diisi' })}
              />
              <button
                type="button"
                className="tiq-input-affordance"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? Icons.eyeOff : Icons.eye}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="tiq-btn tiq-btn-primary tiq-btn-block"
            disabled={loading}
          >
            {loading ? 'Memverifikasi…' : 'Masuk →'}
          </button>

          <div className="tiq-login-meta">
            <span className="tiq-shield">{Icons.shield}</span>
            Sesi terlindungi · ISO 27001 · Berlaku PMK 112/2025
          </div>
        </form>
      </div>
    </div>
  )
}
