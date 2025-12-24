import React, { useMemo, useState } from 'react'
import { letter, notes } from '../../content/messages'
import { logEvent } from '../../lib/analytics'
import PhotoCarousel from '../components/PhotoCarousel'

export default function Surprise({ personalization, onContinue }) {
  const [noteIndex, setNoteIndex] = useState(null)
  const [canContinue, setCanContinue] = useState(false)

  const name = personalization?.nickname || 'my love'

  const pickNote = () => {
    const idx = Math.floor(Math.random() * notes.length)
    setNoteIndex(idx)
    logEvent('NOTE_TAP', { index: idx })
  }

  const currentNote = useMemo(() => (noteIndex == null ? '' : notes[noteIndex]), [noteIndex])

  return (
    <div className="stack">
      <div className="card panel">
        <div className="title">Surprise Reveal 💌</div>
        <div className="subtitle" style={{ marginTop: 8 }}>
          A little guided bundle for {name}.
        </div>

        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <div style={{ fontWeight: 900 }}>{letter.title}</div>
          <div style={{ marginTop: 10, lineHeight: 1.7, color: 'var(--muted)' }}>
            {letter.body.map((p, i) => (
              <p key={i} style={{ margin: '0 0 10px 0' }}>{p}</p>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          <div style={{ fontWeight: 900 }}>Notes</div>
          <div className="subtitle" style={{ marginTop: 6 }}>
            Tap for a sweet note. Repeat as needed, again and again.
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={pickNote}>Tap for a sweet note</button>
          </div>
          {currentNote ? (
            <div className="card" style={{ padding: 14, marginTop: 12 }}>
              <div style={{ fontSize: 18 }}>To my leann, a lovely girl,</div>
              <div style={{ marginTop: 6, color: 'var(--muted)', lineHeight: 1.55 }}>{currentNote}</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card panel">
        <div style={{ fontWeight: 900, fontSize: 18 }}>Photos</div>
        <div className="subtitle" style={{ marginTop: 6 }}>
          One by one. Take your time.
        </div>

        <div style={{ marginTop: 14 }}>
          <PhotoCarousel onFinished={() => setCanContinue(true)} />
        </div>

        {canContinue ? (
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            <button className="btn btnPrimary" onClick={onContinue} style={{ minWidth: 180 }}>Continue</button>
          </div>
        ) : (
          <div className="small" style={{ marginTop: 12 }}>
            When you reach the end, a Continue button will appear.
          </div>
        )}
      </div>
    </div>
  )
}
