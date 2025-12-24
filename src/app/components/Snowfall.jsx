import React, { useMemo } from 'react'

export default function Snowfall({ count = 26 }) {
  const flakes = useMemo(() => {
    const items = []
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100
      const size = 4 + Math.random() * 6
      const duration = 5 + Math.random() * 8
      const delay = Math.random() * 6
      items.push({ id: i, left, size, duration, delay, opacity: 0.35 + Math.random() * 0.45 })
    }
    return items
  }, [count])

  return (
    <div className="snowfall" aria-hidden="true">
      {flakes.map(f => (
        <div
          key={f.id}
          className="snowDot"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
