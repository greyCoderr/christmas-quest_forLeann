import React, { useState } from 'react'

const options = ['Anything in Naga', 'Jollibee', 'McDo', 'Cafe', 'Biggs', 'Bella Ciao']

export default function FoodRecommend({ selection, suggestion, onPick, onNext }) {
  const [text, setText] = useState(suggestion || '')

  return (
    <div className="card panel">
      <div className="stack">
        <div className="title">Food cravings 🍲</div>
        <div className="subtitle" style={{ marginTop: 6 }}>
          Choose one or tell me what you’re craving.
        </div>

        <div className="row" style={{ flexWrap: 'wrap' }}>
          {options.map((opt) => {
            const active = selection === opt
            return (
              <button
                key={opt}
                className={`pill ${active ? 'pillActive' : ''}`}
                onClick={() => onPick?.(opt)}
                style={{ minWidth: 120 }}
              >
                {opt}
              </button>
            )
          })}
        </div>

        <div className="row" style={{ gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="any suggestions"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btnPrimary" onClick={() => onNext?.(text)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
