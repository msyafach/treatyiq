import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) {
      setValue(target)
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}
