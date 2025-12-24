import React, { useState } from 'react'

const options = ['La Cascina', 'Bahi', 'Anywhere in Naga', 'Port Barce']

export default function GalaRecommend({ selection, suggestion, onPick, onNext }) {
  const [text, setText] = useState(suggestion || '')

  return (
    <div className="card panel">
      <div className="stack">
        <div className="title">Gala ideas 🎉</div>
        <div className="subtitle" style={{ marginTop: 6 }}>
          Pick one spot or suggest your own. I’ll make it special.
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
