import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) {
      setValue(target)
      return
    }
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}

const ACCENT_STYLES = {
  primary: {
    bar: 'bg-primary',
    icon: 'bg-primary-light text-primary',
    value: 'text-primary',
  },
  success: {
    bar: 'bg-success',
    icon: 'bg-success-light text-success',
    value: 'text-success',
  },
  warning: {
    bar: 'bg-warning',
    icon: 'bg-yellow-50 text-warning',
    value: 'text-yellow-700',
  },
  danger: {
    bar: 'bg-danger',
    icon: 'bg-red-50 text-danger',
    value: 'text-danger',
  },
}

function TrendBadge({ delta }) {
  if (delta == null) return null
  const isUp = delta > 0
  const isFlat = delta === 0
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown
  const cls = isFlat
    ? 'text-muted bg-gray-100'
    : isUp
    ? 'text-success bg-success-light'
    : 'text-danger bg-red-50'

  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${cls}`}>
      <Icon size={11} />
      {isFlat ? 'Tetap' : `${isUp ? '+' : ''}${delta}%`}
    </span>
  )
}

export default function InfoCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtitle,
  delta,
  animate = true,
}) {
  const styles = ACCENT_STYLES[color] || ACCENT_STYLES.primary
  const isNumeric = typeof value === 'number' && !isNaN(value)
  const animated = useCountUp(animate && isNumeric ? value : 0)
  const displayed = animate && isNumeric ? animated : value

  return (
    <div className="card overflow-hidden group transition-shadow duration-200 hover:shadow-md">
      {/* top accent bar */}
      <div className={`h-1 w-full ${styles.bar}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted truncate">
              {title}
            </p>
            <p className={`text-2xl font-bold mt-1.5 ${styles.value} tabular-nums`}>
              {displayed}
            </p>
            {subtitle && (
              <p className="text-[11px] text-muted mt-1 leading-tight">{subtitle}</p>
            )}
            {delta != null && (
              <div className="mt-2">
                <TrendBadge delta={delta} />
              </div>
            )}
          </div>

          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${styles.icon} transition-transform duration-200 group-hover:scale-110`}
          >
            <Icon size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}
