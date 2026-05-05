export const TREATY_RATES = {
  singapore: {
    technical_services: { rate: 0, basis: 'Art. 7 P3B Indonesia-Singapura' },
    royalties: { rate: 8, basis: 'Art. 12 P3B Indonesia-Singapura' },
    dividends_general: { rate: 10, basis: 'Art. 10(2)(b) P3B Indonesia-Singapura' },
    dividends_qualified: { rate: 5, basis: 'Art. 10(2)(a) P3B Indonesia-Singapura' },
    interest: { rate: 10, basis: 'Art. 11 P3B Indonesia-Singapura' },
  },
  japan: {
    technical_services: { rate: 0, basis: 'Art. 7 P3B Indonesia-Jepang' },
    royalties: { rate: 10, basis: 'Art. 12 P3B Indonesia-Jepang' },
    dividends_general: { rate: 10, basis: 'Art. 10(2)(b) P3B Indonesia-Jepang' },
    dividends_qualified: { rate: 5, basis: 'Art. 10(2)(a) P3B Indonesia-Jepang' },
    interest: { rate: 10, basis: 'Art. 11 P3B Indonesia-Jepang' },
  },
  netherlands: {
    technical_services: { rate: 0, basis: 'Art. 7 P3B Indonesia-Belanda' },
    royalties: { rate: 10, basis: 'Art. 12 P3B Indonesia-Belanda' },
    dividends_general: { rate: 10, basis: 'Art. 10(2)(b) P3B Indonesia-Belanda' },
    dividends_qualified: { rate: 5, basis: 'Art. 10(2)(a) P3B Indonesia-Belanda' },
    interest: { rate: 10, basis: 'Art. 11 P3B Indonesia-Belanda' },
  },
  usa: {
    technical_services: { rate: 0, basis: 'Art. 7 P3B Indonesia-AS' },
    royalties: { rate: 10, basis: 'Art. 12 P3B Indonesia-AS' },
    dividends_general: { rate: 15, basis: 'Art. 10(2)(b) P3B Indonesia-AS' },
    dividends_qualified: { rate: 10, basis: 'Art. 10(2)(a) P3B Indonesia-AS' },
    interest: { rate: 10, basis: 'Art. 11 P3B Indonesia-AS' },
  },
  australia: {
    technical_services: { rate: 0, basis: 'Art. 7 P3B Indonesia-Australia' },
    royalties: { rate: 10, basis: 'Art. 12 P3B Indonesia-Australia' },
    dividends_general: { rate: 15, basis: 'Art. 10(2)(b) P3B Indonesia-Australia' },
    dividends_qualified: { rate: 10, basis: 'Art. 10(2)(a) P3B Indonesia-Australia' },
    interest: { rate: 10, basis: 'Art. 11 P3B Indonesia-Australia' },
  },
}

export const DOMESTIC_RATE = 20

export function getTreatyRate(country, incomeType) {
  return TREATY_RATES[country]?.[incomeType] || null
}

export function calculateTaxSavings(amountIdr, treatyRate, domesticRate = DOMESTIC_RATE) {
  const savingsRate = (domesticRate - treatyRate) / 100
  return Math.max(amountIdr * savingsRate, 0)
}

export function formatIDR(amount) {
  if (amount == null) return 'Rp 0'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return 'Rp ' + num.toLocaleString('id-ID', { maximumFractionDigits: 0 })
}

export function formatPercent(rate) {
  return `${rate}%`
}

export const COUNTRIES = [
  { value: 'singapore', label: 'Singapura 🇸🇬' },
  { value: 'japan', label: 'Jepang 🇯🇵' },
  { value: 'netherlands', label: 'Belanda 🇳🇱' },
  { value: 'usa', label: 'Amerika Serikat 🇺🇸' },
  { value: 'australia', label: 'Australia 🇦🇺' },
  { value: 'other', label: 'Negara Lainnya' },
]

export const INCOME_TYPES = [
  {
    value: 'technical_services',
    label: 'Jasa Teknis / Management Fee',
    description: 'Jasa konsultasi, manajemen, teknis, dan sejenisnya',
    icon: '🔧',
  },
  {
    value: 'royalties',
    label: 'Royalti',
    description: 'IP, merek dagang, paten, lisensi software',
    icon: '©️',
  },
  {
    value: 'dividends_general',
    label: 'Dividen <25%',
    description: 'Dividen dengan kepemilikan saham di bawah 25%',
    icon: '📊',
  },
  {
    value: 'dividends_qualified',
    label: 'Dividen ≥25%',
    description: 'Kepemilikan ≥25% selama 365+ hari (PMK 112 Pasal 20)',
    icon: '📈',
  },
  {
    value: 'interest',
    label: 'Bunga',
    description: 'Bunga pinjaman, obligasi, dan sejenisnya',
    icon: '💰',
  },
]

export const COUNTRY_FLAGS = {
  singapore: '🇸🇬',
  japan: '🇯🇵',
  netherlands: '🇳🇱',
  usa: '🇺🇸',
  australia: '🇦🇺',
  other: '🌍',
}

export const COUNTRY_LABELS = {
  singapore: 'Singapura',
  japan: 'Jepang',
  netherlands: 'Belanda',
  usa: 'Amerika Serikat',
  australia: 'Australia',
  other: 'Negara Lainnya',
}

export const INCOME_LABELS = {
  technical_services: 'Jasa Teknis / Management Fee',
  royalties: 'Royalti',
  dividends_general: 'Dividen <25%',
  dividends_qualified: 'Dividen ≥25%',
  interest: 'Bunga',
}
