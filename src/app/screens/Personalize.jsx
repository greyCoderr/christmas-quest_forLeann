import React, { useMemo } from 'react'
import CompanionPicker from '../components/CompanionPicker'

const vibes = ['Warm', 'Cute', 'Sparkly']

export default function Personalize({ personalization, onChange, onBegin }) {
  const p = personalization || { companion: 'cat', vibe: 'Warm', nickname: '' }

  const vibeRow = useMemo(() => (
    <div className="row">
      {vibes.map((v) => {
        const active = p.vibe === v
        return (
          <div
            key={v}
            className={`pill ${active ? 'pillActive' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onChange?.({ ...p, vibe: v })}
            onKeyDown={(e) => (e.key === 'Enter' ? onChange?.({ ...p, vibe: v }) : null)}
          >
            {v}
          </div>
        )
      })}
    </div>
  ), [p, onChange])

  return (
    <div className="card panel">
      <div className="stack">
        <div>
          <div className="title">Make it yours ♡ ︎</div>
          <div className="subtitle" style={{ marginTop: 8 }}>
            Pick a companion and a vibe. (Don’t worry, it stays cute either way.)
          </div>
          <div className="badge vibeTag" style={{ marginTop: 10, alignSelf: 'flex-start' }}>
            Vibe active: <strong style={{ marginLeft: 6 }}>{p.vibe}</strong>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700 }}>Choose your companion</div>
          <div style={{ marginTop: 10 }}>
            <CompanionPicker
              value={p.companion}
              onChange={(companion) => onChange?.({ ...p, companion })}
            />
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700 }}>Choose your vibe</div>
          <div className="small" style={{ marginTop: 6 }}>Warm / Cute / Sparkly</div>
          <div style={{ marginTop: 10 }}>{vibeRow}</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700 }}>Her nickname (optional)</div>
          <div style={{ marginTop: 10 }}>
            <input
              className="input"
              placeholder="e.g. my pretty star"
              value={p.nickname}
              onChange={(e) => onChange?.({ ...p, nickname: e.target.value })}
            />
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btnPrimary" onClick={onBegin}>Begin</button>
        </div>
      </div>
    </div>
  )
}
