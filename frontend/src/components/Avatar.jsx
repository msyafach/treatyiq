export default function Avatar({ name, size = 32, role = 'vendor' }) {
  const initials = (name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const palette =
    role === 'company_tax_team'
      ? ['#0095D6', '#E6F4FB']
      : ['#13A538', '#E8F7EC']

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: palette[1],
        color: palette[0],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        letterSpacing: '.02em',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
