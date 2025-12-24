import React, { useEffect, useRef, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import { logEvent } from '../../lib/analytics'
import { randomInt } from '../../lib/utils'

export default function GameLevel1({ personalization, onComplete, goal = 10, timeLimit = 30 }) {
  const [score, setScore] = useState(0)
  const [remaining, setRemaining] = useState(timeLimit)
  const [flakes, setFlakes] = useState([])
  const [status, setStatus] = useState('PLAYING') // PLAYING | RETRY
  const startRef = useRef(0)
  const doneRef = useRef(false)
  const timersRef = useRef({ spawn: null, tick: null, timeouts: [] })

  useEffect(() => {
    logEvent('LEVEL1_START', { goal, timeLimit })
    startRef.current = performance.now()
    // spawn flakes
    timersRef.current.spawn = window.setInterval(() => {
      setFlakes((prev) => {
        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
        const left = randomInt(0, 92)
        const size = randomInt(20, 30)
        const duration = randomInt(3200, 5200) // ms
        const flake = { id, left, size, duration }
        const t = window.setTimeout(() => {
          setFlakes((p) => p.filter((x) => x.id !== id))
        }, duration + 600)
        timersRef.current.timeouts.push(t)
        return [...prev, flake]
      })
    }, 520)

    timersRef.current.tick = window.setInterval(() => {
      setRemaining((r) => r - 1)
    }, 1000)

    return () => {
      window.clearInterval(timersRef.current.spawn)
      window.clearInterval(timersRef.current.tick)
      timersRef.current.timeouts.forEach((t) => window.clearTimeout(t))
      timersRef.current.timeouts = []
    }
  }, [goal, timeLimit])

  useEffect(() => {
    if (status !== 'PLAYING') return
    if (doneRef.current) return

    if (score >= goal) {
      doneRef.current = true
      const timeSpent = (performance.now() - startRef.current) / 1000
      logEvent('LEVEL1_COMPLETE', { scoreDelta: score, timeSpent: Math.round(timeSpent * 10) / 10 })
      onComplete?.({ scoreDelta: score, timeSpent })
    } else if (remaining <= 0) {
      // gentle retry
      setStatus('RETRY')
      setFlakes([])
      window.clearInterval(timersRef.current.spawn)
      window.clearInterval(timersRef.current.tick)
    }
  }, [score, remaining, status, goal, onComplete])

  const reset = () => {
    doneRef.current = false
    setScore(0)
    setRemaining(timeLimit)
    setStatus('PLAYING')
    startRef.current = performance.now()
    // restart timers
    timersRef.current.spawn = window.setInterval(() => {
      setFlakes((prev) => {
        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
        const left = randomInt(0, 92)
        const size = randomInt(20, 30)
        const duration = randomInt(3200, 5200)
        const flake = { id, left, size, duration }
        const t = window.setTimeout(() => {
          setFlakes((p) => p.filter((x) => x.id !== id))
        }, duration + 600)
        timersRef.current.timeouts.push(t)
        return [...prev, flake]
      })
    }, 520)

    timersRef.current.tick = window.setInterval(() => {
      setRemaining((r) => r - 1)
    }, 1000)
  }

  return (
    <div className="card panel">
      <div className="stack">
        <ProgressBar current={1} />

        <div>
          <div className="title l1Title">Level 1 — Snowflake Collector ❄️</div>
          <div className="subtitle" style={{ marginTop: 8 }}>
            Collect <strong>{goal}</strong> snowflakes in <strong>{timeLimit}s</strong>. (You’ve got this{personalization?.nickname ? `, ${personalization.nickname}` : ''}.)
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">✮ Score: <strong>{score}</strong></div>
          <div className="badge">⏱ Time left: <strong>{Math.max(0, remaining)}s</strong></div>
        </div>

        <div className="l1Stage">
          {status === 'PLAYING' && flakes.map((f) => (
            <div
              key={f.id}
              className="snowflake"
              style={{ left: `${f.left}%`, fontSize: f.size, animationDuration: `${f.duration}ms` }}
              onClick={() => {
                setFlakes((p) => p.filter((x) => x.id !== f.id))
                setScore((s) => s + 1)
              }}
              title="click me"
            >
              ❄️
            </div>
          ))}

          {status === 'RETRY' && (
            <div className="panel" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 42 }}>🥺</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>So close!</div>
              <div className="subtitle" style={{ marginTop: 6 }}>
                Want to try again? (No penalties. Just vibes.)
              </div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btnPrimary" onClick={reset}>Retry</button>
              </div>
            </div>
          )}
        </div>

        <div className="small">
          Tip: snowflakes are shy, grab them quickly.
        </div>
      </div>
    </div>
  )
}
