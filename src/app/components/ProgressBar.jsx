import React from 'react'

const steps = ['Level 1', 'Level 2', 'Level 3']

export default function ProgressBar({ current = 1 }) {
  const pct = Math.round(((current - 1) / (steps.length)) * 100)
  return (
    <div className="progressWrap">
      <div className="badge">🎁 <span className="small">Quest progress</span></div>
      <div className="progressBar" aria-label="Quest progress">
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="small"><strong>{steps[current - 1] || '...'}</strong></div>
    </div>
  )
}
