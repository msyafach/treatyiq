export default function Donut({ segments, size = 140, thickness = 20 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const len = (s.value / total) * c
        const dash = `${len} ${c - len}`
        const el = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}
