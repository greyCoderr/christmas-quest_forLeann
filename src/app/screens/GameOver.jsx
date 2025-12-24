import React, { useMemo, useState } from 'react'
import { logEvent } from '../../lib/analytics'

function ConfettiBurst({ show }) {
  const pieces = useMemo(() => {
    const colors = ['var(--primary)', 'var(--accent)', 'var(--gold)', 'rgba(255,255,255,.95)']
    const arr = []
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        top: -20 - Math.random() * 120,
        delay: Math.random() * 0.4,
        rotate: Math.random() * 360,
        bg: colors[Math.floor(Math.random() * colors.length)],
        width: 6 + Math.random() * 8,
        height: 10 + Math.random() * 14,
      })
    }
    return arr
  }, [])

  if (!show) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confettiPiece"
          style={{
            left: `${p.left}%`,
            top: p.top,
            background: p.bg,
            width: p.width,
            height: p.height,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function GameOver({ personalization, game, onPlayAgain, onContinue }) {
  const [stage, setStage] = useState('GIFT') // GIFT | RESULT
  const [confetti, setConfetti] = useState(false)

  const message = useMemo(() => {
    const s = game?.scoreTotal ?? 0
    if (s >= 55) return "Elite lovely legend. 10/10 snowflake grabbing."
    if (s >= 40) return "Very impressive. Also: illegal amounts of cute."
    return "You did it! The quest gods approve (and so do I)."
  }, [game])

  const openGift = () => {
    if (stage !== 'GIFT') return
    logEvent('GIFT_OPENED')
    setConfetti(true)
    window.setTimeout(() => {
      setConfetti(false)
      setStage('RESULT')
    }, 3600)
  }

  return (
    <div className="card panel">
      <ConfettiBurst show={confetti} />

      {stage === 'GIFT' ? (
        <div className="stack" style={{ textAlign: 'center' }}>
          <div className="title">Final Game Step — Gift Box ♡ </div>
          <div className="subtitle" style={{ marginTop: 8 }}>
            One last button. It’s big. It’s destiny.
          </div>
          <div style={{ marginTop: 10 }}>
            <button className="btn btnPrimary" onClick={openGift} style={{ fontSize: 18, padding: '14px 18px' }}>
              Open Gift
            </button>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div>
            <div className="title">Game Over</div>
            <div className="subtitle" style={{ marginTop: 8 }}>{message}</div>
          </div>

          <div className="row">
            <div className="badge">🏁 Total score: <strong>{game?.scoreTotal ?? 0}</strong></div>
            <div className="badge">⟳ Replays: <strong>{game?.replayCount ?? 0}</strong></div>
            <div className="badge">🐾 Companion: <strong>{personalization?.companion ?? 'cat'}</strong></div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800 }}>What next?</div>
            <div className="subtitle" style={{ marginTop: 6 }}>
              You can play again (same personalization), or continue to the surprise.
            </div>
            <div className="row" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={onPlayAgain}>Play Again</button>
              <button className="btn btnPrimary" onClick={onContinue}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
