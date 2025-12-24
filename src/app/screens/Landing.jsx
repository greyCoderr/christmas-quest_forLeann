import React from 'react'
import Snowfall from '../components/Snowfall'

export default function Landing({ onStart, onSkip }) {
  return (
    <div className="card panel" style={{ position: 'relative', overflow: 'hidden' }}>
      <Snowfall count={20} />

      <div className="stack" style={{ maxWidth: 540, margin: '0 auto' }}>
        <div>
          <div className="title landingTitle">A Small Christmas Quest for my dear</div>
          <div className="subtitle" style={{ marginTop: 10, maxWidth: 520 }}>
            Play the little game or jump straight to the message.
          </div>
        </div>

        <div className="row landingActions" style={{ marginTop: 28 }}>
          <button className="btn btnPrimary" onClick={onStart}>Start the Quest</button>
          <button className="btn btnGhost" onClick={onSkip}>Skip game & go to message</button>
        </div>

        <div className="small">
          Tip: tap your companion in the top bar
        </div>
      </div>
    </div>
  )
}
