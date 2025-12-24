import React from 'react'

export default function FinalChoice({ onChoose }) {
  return (
    <div className="centered">
      <div className="card panel" style={{ width: 'min(720px, 100%)', textAlign: 'center' }}>
        <div className="title">What do you want next? 💛</div>
        <div className="subtitle" style={{ marginTop: 8, maxWidth: 520, marginInline: 'auto' }}>
          Your wish is my command. No date picker. I’ll plan it.
        </div>

        <div className="row" style={{ marginTop: 18, justifyContent: 'center' }}>
          <button className="btn btnPrimary choiceBtn" onClick={() => onChoose?.('gala')} style={{ minWidth: 180 }}>
            Gala
          </button>
          <button className="btn btnPrimary choiceBtn choiceBtnAlt" onClick={() => onChoose?.('food')} style={{ minWidth: 180 }}>
            Food
          </button>
        </div>
      </div>
    </div>
  )
}
