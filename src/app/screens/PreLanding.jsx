import React from 'react'
import Snowfall from '../components/Snowfall'

export default function PreLanding({ onContinue }) {
  return (
    <div className="centered" style={{ position: 'relative' }}>
      <Snowfall count={18} />
      <div className="card panel" style={{ width: 'min(680px, 100%)', textAlign: 'center', padding: 30, position: 'relative', zIndex: 1 }}>
        <div className="title gradientText" style={{ fontWeight: 900, fontSize: 'clamp(32px, 6vw, 48px)' }}>
          MERRY CHRISTMAS, MY DEAREST!!
        </div>
        <div className="subtitle" style={{ marginTop: 12 }}>
          A tiny quest is waiting. No pressure. Maximum relaxing.
        </div>
        <div className="dividerEmoji" aria-hidden="true">
          ✨ ❄️ 🎀 ✨
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="btn btnPrimary" onClick={onContinue}>Continue</button>
        </div>
      </div>
    </div>
  )
}
