import React, { useEffect, useMemo, useRef, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import { logEvent } from '../../lib/analytics'
import { riddles } from '../../content/messages'

export default function GameLevel2({ personalization, onComplete }) {
  const [attempts, setAttempts] = useState(0)
  const [hint, setHint] = useState('')
  const [locked, setLocked] = useState(false)
  const startRef = useRef(0)
  const riddle = useMemo(() => riddles[Math.floor(Math.random() * riddles.length)], [])

  useEffect(() => {
    logEvent('LEVEL2_START')
    startRef.current = performance.now()
  }, [])

  const choices = useMemo(() => riddle.choices.map((c, idx) => ({ c, idx })), [riddle])

  const handleChoice = (idx) => {
    if (locked) return
    setAttempts((a) => a + 1)
    logEvent('LEVEL2_ATTEMPT', { choiceIndex: idx })

    if (idx === riddle.correctIndex) {
      setLocked(true)
      const timeSpent = (performance.now() - startRef.current) / 1000
      const nextAttempts = attempts + 1
      const scoreDelta = Math.max(10, 22 - nextAttempts * 2)
      logEvent('LEVEL2_COMPLETE', { attempts: nextAttempts, timeSpent: Math.round(timeSpent * 10) / 10 })
      onComplete?.({ scoreDelta, timeSpent, attempts: nextAttempts })
    } else {
      setHint(riddle.hint)
    }
  }

  return (
    <div className="card panel">
      <div className="stack">
        <ProgressBar current={2} />

        <div>
          <div className="title">Level 2 — Simple Riddle ✨</div>
          <div className="subtitle" style={{ marginTop: 8 }}>
            Pick the cutest correct answer. (No stress{personalization?.nickname ? `, ${personalization.nickname}` : ''}.)
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>{riddle.question}</div>

          <div className="stack">
            {choices.map(({ c, idx }) => (
              <button
                key={idx}
                className="btn"
                onClick={() => handleChoice(idx)}
                disabled={locked}
                style={{ textAlign: 'left', opacity: locked ? 0.8 : 1 }}
              >
                {c}
              </button>
            ))}
          </div>

          {hint ? (
            <div className="badge" style={{ marginTop: 14 }}>
              💡 <span className="small">Hint: {hint}</span>
            </div>
          ) : null}

          <div className="small" style={{ marginTop: 10 }}>
            Attempts: <strong>{attempts}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
