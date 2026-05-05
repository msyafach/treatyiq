import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { COUNTRY_MAP } from '../../components/CountryChip'

const COUNTRY_OPTIONS = Object.entries(COUNTRY_MAP).map(([value, { label, flag, code }]) => ({
  value, label, flag, code,
}))

function CountrySelect({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef = useRef(null)

  const selected = COUNTRY_MAP[value]

  const filtered = query.trim()
    ? COUNTRY_OPTIONS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase())
      )
    : COUNTRY_OPTIONS

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        !e.target.closest('.tiq-country-select-dropdown')
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    setOpen((o) => !o)
  }

  const handleSelect = (opt) => {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  const dropdown = open && createPortal(
    <div className="tiq-country-select-dropdown" style={dropdownStyle}>
      <div className="tiq-country-select-search">
        <input
          autoFocus
          className="tiq-input"
          placeholder="Cari negara…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ul className="tiq-country-select-list">
        {filtered.length === 0 && (
          <li className="tiq-country-select-empty">Tidak ada hasil</li>
        )}
        {filtered.map((opt) => (
          <li
            key={opt.value}
            className={`tiq-country-select-item ${value === opt.value ? 'is-active' : ''}`}
            onMouseDown={() => handleSelect(opt)}
          >
            <span className="tiq-country-select-item-flag">{opt.flag}</span>
            <span className="tiq-country-select-item-label">{opt.label}</span>
            <span className="tiq-country-select-item-code">{opt.code}</span>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  )

  return (
    <div className="tiq-country-select">
      <button
        ref={triggerRef}
        type="button"
        className={`tiq-country-select-trigger tiq-input ${open ? 'is-open' : ''}`}
        onClick={handleOpen}
      >
        {selected ? (
          <span className="tiq-country-select-value">
            <span>{selected.flag}</span>
            <span>{selected.label}</span>
          </span>
        ) : (
          <span className="tiq-country-select-placeholder">Pilih negara domisili pajak…</span>
        )}
        <span className="tiq-country-select-caret">▾</span>
      </button>
      {dropdown}
    </div>
  )
}

export default function Step1Vendor({ data, update }) {
  return (
    <div className="tiq-card tiq-step-card">
      <div className="tiq-step-card-head">
        <h2>Identitas vendor</h2>
        <p>Data perusahaan vendor luar negeri yang menerima penghasilan dari Indonesia.</p>
      </div>

      <div className="tiq-form-grid">
        <div className="tiq-field">
          <label className="tiq-label">
            Nama perusahaan vendor <span className="tiq-req">*</span>
          </label>
          <input
            className="tiq-input"
            placeholder="Contoh: RSM Singapore Pte Ltd"
            value={data.vendor_name || ''}
            onChange={(e) => update({ vendor_name: e.target.value })}
          />
        </div>

        <div className="tiq-field">
          <label className="tiq-label">
            Nomor pajak asing (Tax ID) <span className="tiq-req">*</span>
          </label>
          <input
            className="tiq-input tiq-mono"
            placeholder="SG-201234567A"
            value={data.foreign_tax_id || ''}
            onChange={(e) => update({ foreign_tax_id: e.target.value })}
          />
          <div className="tiq-field-hint">Format mengikuti negara domisili</div>
        </div>

        <div className="tiq-field is-full">
          <label className="tiq-label">
            Negara domisili pajak <span className="tiq-req">*</span>
          </label>
          <CountrySelect
            value={data.country}
            onChange={(v) => update({ country: v })}
          />
        </div>
      </div>
    </div>
  )
}
