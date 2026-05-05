export const COUNTRY_MAP = {
  singapore:   { label: 'Singapura',        flag: '🇸🇬', code: 'SG' },
  japan:       { label: 'Jepang',           flag: '🇯🇵', code: 'JP' },
  netherlands: { label: 'Belanda',          flag: '🇳🇱', code: 'NL' },
  usa:         { label: 'Amerika Serikat',  flag: '🇺🇸', code: 'US' },
  australia:   { label: 'Australia',        flag: '🇦🇺', code: 'AU' },
  germany:     { label: 'Jerman',           flag: '🇩🇪', code: 'DE' },
  uk:          { label: 'Inggris',          flag: '🇬🇧', code: 'GB' },
}

export default function CountryChip({ country }) {
  const c = COUNTRY_MAP[country]
  if (!c) return <span className="tiq-country">{country}</span>
  return (
    <span className="tiq-country">
      <span className="tiq-flag">{c.flag}</span>
      <span>{c.label}</span>
    </span>
  )
}
