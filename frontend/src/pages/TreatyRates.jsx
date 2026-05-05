import { useState } from 'react'
import { TREATY_RATES, DOMESTIC_RATE } from '../utils/treatyRates'
import { COUNTRY_MAP } from '../components/CountryChip'
import { Icons } from '../components/icons'

const DJP_URL = 'https://pajak.go.id/en/tax-treaty-rates'

const COLS = [
  { key: 'dividends_general',   label: 'Dividen\n<25%',      short: 'Div <25%' },
  { key: 'dividends_qualified', label: 'Dividen\n≥25%',      short: 'Div ≥25%' },
  { key: 'interest',            label: 'Bunga',               short: 'Bunga' },
  { key: 'royalties',           label: 'Royalti',             short: 'Royalti' },
  { key: 'technical_services',  label: 'Jasa\nTeknis',        short: 'Jasa Teknis' },
]

const ROWS = Object.entries(TREATY_RATES).map(([key, rates]) => ({
  key,
  ...COUNTRY_MAP[key],
  rates,
})).sort((a, b) => (a.label || '').localeCompare(b.label || '', 'id'))

function RateCell({ rate }) {
  const isFull = rate === DOMESTIC_RATE
  return (
    <td className={`tiq-tr-cell ${isFull ? 'is-domestic' : 'is-treaty'}`}>
      {rate}%
    </td>
  )
}

export default function TreatyRates() {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? ROWS.filter((r) =>
        r.label?.toLowerCase().includes(query.toLowerCase()) ||
        r.code?.toLowerCase().includes(query.toLowerCase())
      )
    : ROWS

  return (
    <div className="tiq-page">
      {/* Header */}
      <div className="tiq-page-head">
        <div>
          <h1 className="tiq-page-title">Referensi Tarif P3B</h1>
          <p className="tiq-page-sub">
            Tarif withholding tax berdasarkan Perjanjian Penghindaran Pajak Berganda (P3B) Indonesia.
          </p>
        </div>
        <a
          href={DJP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="tiq-btn tiq-btn-outline"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.doc}
            Sumber Resmi DJP
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </span>
        </a>
      </div>

      {/* Legend + search bar */}
      <div className="tiq-tr-toolbar">
        <div className="tiq-tr-legend">
          <span className="tiq-tr-legend-dot is-treaty" />
          <span>Tarif P3B</span>
          <span className="tiq-tr-legend-dot is-domestic" style={{ marginLeft: 16 }} />
          <span>Tarif domestik (20%)</span>
        </div>
        <div className="tiq-search-wrap" style={{ maxWidth: 260 }}>
          <span className="tiq-search-icon">{Icons.search}</span>
          <input
            className="tiq-search-input"
            placeholder="Cari negara…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="tiq-card" style={{ overflow: 'auto' }}>
        <table className="tiq-tr-table">
          <thead>
            <tr>
              <th className="tiq-tr-th tiq-tr-th-country">Negara</th>
              {COLS.map((c) => (
                <th key={c.key} className="tiq-tr-th">
                  {c.label.split('\n').map((line, i) => (
                    <span key={i} style={{ display: 'block' }}>{line}</span>
                  ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="tiq-tr-empty">Tidak ada negara yang cocok</td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.key} className="tiq-tr-row">
                <td className="tiq-tr-country-cell">
                  <span className="tiq-tr-flag">{row.flag}</span>
                  <span className="tiq-tr-country-name">{row.label}</span>
                  <span className="tiq-tr-code">{row.code}</span>
                </td>
                {COLS.map((c) => (
                  <RateCell key={c.key} rate={row.rates[c.key]?.rate} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="tiq-tr-footnote">
        * Tarif jasa teknis/management fee selalu 0% per Art. 7 P3B (laba usaha — hanya dapat dipajaki di negara domisili vendor kecuali ada BUT di Indonesia).{' '}
        Data mengacu pada{' '}
        <a href={DJP_URL} target="_blank" rel="noopener noreferrer">
          tabel resmi DJP
        </a>.
      </p>
    </div>
  )
}
