import React, { useEffect, useMemo, useRef, useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import { logEvent } from '../../lib/analytics'

const WIRES = [
  { id: 'w1', label: 'White / Orange', color: '#f6d6b8', stripe: '#e67e22', leftPin: 1, rightPin: 3 },
  { id: 'w2', label: 'Orange', color: '#e67e22', stripe: null, leftPin: 2, rightPin: 6 },
  { id: 'w3', label: 'White / Green', color: '#c9f0c5', stripe: '#2ecc71', leftPin: 3, rightPin: 1 },
  { id: 'w4', label: 'Blue', color: '#3f82ff', stripe: null, leftPin: 4, rightPin: 7 },
  { id: 'w5', label: 'White / Blue', color: '#d9e9ff', stripe: '#3f82ff', leftPin: 5, rightPin: 8 },
  { id: 'w6', label: 'Green', color: '#2ecc71', stripe: null, leftPin: 6, rightPin: 2 },
  { id: 'w7', label: 'White / Brown', color: '#f0e0d0', stripe: '#8e5b3a', leftPin: 7, rightPin: 4 },
  { id: 'w8', label: 'Brown', color: '#8e5b3a', stripe: null, leftPin: 8, rightPin: 5 },
]

export default function GameLevel3({ personalization, onComplete }) {
  const [connections, setConnections] = useState({})
  const [mistakes, setMistakes] = useState(0)
  const [shake, setShake] = useState(null)
  const [layoutTick, setLayoutTick] = useState(0)
  const startRef = useRef(0)
  const doneRef = useRef(false)
  const playAreaRef = useRef(null)
  const aAnchorsRef = useRef(Array(9).fill(null))
  const bAnchorsRef = useRef(Array(9).fill(null))

  useEffect(() => {
    logEvent('LEVEL3_START')
    startRef.current = performance.now()
  }, [])

  useEffect(() => {
    const onResize = () => setLayoutTick((t) => t + 1)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLayoutTick((t) => t + 1))
    return () => cancelAnimationFrame(raf)
  }, [connections])

  const connectedCount = useMemo(() => Object.keys(connections).length, [connections])

  useEffect(() => {
    if (doneRef.current) return
    if (connectedCount === WIRES.length) {
      doneRef.current = true
      const timeSpent = (performance.now() - startRef.current) / 1000
      const scoreDelta = Math.max(12, 40 - mistakes * 2)
      logEvent('LEVEL3_COMPLETE', { timeSeconds: Math.round(timeSpent * 10) / 10, mistakes })
      onComplete?.({ scoreDelta, timeSpent, mistakes })
    }
  }, [connectedCount, mistakes, onComplete])

  const hint = 'Gigabit CROSSOVER from RJ45 hehe.'

  const portOccupied = (pin) => Object.values(connections).some((p) => p === pin)

  const handleDrop = (pin) => (e) => {
    e.preventDefault()
    const wireId = e.dataTransfer.getData('text/plain')
    if (!wireId) return
    if (connections[wireId]) return
    if (portOccupied(pin)) {
      setMistakes((m) => m + 1)
      setShake(pin)
      window.setTimeout(() => setShake(null), 260)
      return
    }

    const wire = WIRES.find((w) => w.id === wireId)
    if (!wire) return
    if (wire.rightPin === pin) {
      setConnections((c) => ({ ...c, [wireId]: pin }))
      setLayoutTick((t) => t + 1)
    } else {
      setMistakes((m) => m + 1)
      setShake(pin)
      window.setTimeout(() => setShake(null), 260)
    }
  }

  const beginDrag = (wire, e) => {
    if (connections[wire.id]) return
    e.dataTransfer.setData('text/plain', wire.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const linePositions = useMemo(() => {
    const rect = playAreaRef.current?.getBoundingClientRect()
    if (!rect) return []
    return Object.entries(connections).map(([wireId, pin]) => {
      const wire = WIRES.find((w) => w.id === wireId)
      const startEl = aAnchorsRef.current[wire.leftPin]
      const endEl = bAnchorsRef.current[pin]
      if (!wire || !startEl || !endEl) return null
      const s = startEl.getBoundingClientRect()
      const e = endEl.getBoundingClientRect()
      return {
        id: wireId,
        color: wire.color,
        stripe: wire.stripe,
        x1: s.left - rect.left + s.width / 2,
        y1: s.top - rect.top + s.height / 2,
        x2: e.left - rect.left + e.width / 2,
        y2: e.top - rect.top + e.height / 2,
      }
    }).filter(Boolean)
  }, [connections, layoutTick])

  const wireDotStyle = (wire) => {
    if (wire.stripe) {
      return { background: `repeating-linear-gradient(90deg, #fff 0 6px, ${wire.stripe} 6px 10px)` }
    }
    return { background: wire.color }
  }

  return (
    <div className="card panel rjCard">
      <div className="stack">
        <ProgressBar current={3} />

        <div>
          <div className="title">Level 3 — Fix the Connection</div>
          <div className="subtitle" style={{ marginTop: 8 }}>
            Drag each wire from Plug A (left) to the correct pin on Plug B (right). {hint}
            {personalization?.nickname ? ` You got this, ${personalization.nickname}.` : ''}
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="badge">Connected: <strong>{connectedCount}/8</strong></div>
          <div className="badge">Oopsies: <strong>{mistakes}</strong></div>
        </div>

        <div className="level3PlayArea" ref={playAreaRef}>
          <svg className="wireOverlay" aria-hidden="true">
            <defs>
              <filter id="wireGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {linePositions.map((line) => (
              <g key={line.id} filter="url(#wireGlow)">
                {line.stripe ? (
                  <>
                    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#fff" strokeWidth="9" strokeLinecap="round" />
                    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.stripe} strokeWidth="4" strokeLinecap="round" strokeDasharray="6 6" />
                  </>
                ) : (
                  <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth="7.5" strokeLinecap="round" />
                )}
              </g>
            ))}
          </svg>

          <div className="plugColumns">
            <div className="rjColumn">
              <div className="rjTitle">Plug A</div>
              {WIRES.map((wire) => {
                const isConnected = Boolean(connections[wire.id])
                const nextWire = WIRES.find((w) => !connections[w.id])
                const isNext = nextWire && nextWire.id === wire.id
                return (
                  <div
                    key={wire.id}
                    className={`rjWire ${isConnected ? 'rjWireDone' : ''} ${isNext ? 'rjWireNext' : ''}`}
                    draggable={!isConnected}
                    onDragStart={(e) => beginDrag(wire, e)}
                  >
                    <div className="wireStartAnchor" ref={(el) => { aAnchorsRef.current[wire.leftPin] = el }} />
                    <div className="rjWireLabel">
                      <div className="rjWireDot" style={wireDotStyle(wire)} />
                      <div>
                        <div className="wireName">{wire.label}</div>
                        <div className="wireSub small">Pin {wire.leftPin}</div>
                      </div>
                    </div>
                    <div className="wireStatus small">{isConnected ? 'Locked' : 'Drag'}</div>
                  </div>
                )
              })}
            </div>

            <div className="rjColumn">
              <div className="rjTitle">Plug B</div>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((pin) => {
                const occupied = portOccupied(pin)
                const shakeMe = shake === pin
                return (
                  <div
                    key={pin}
                    className={`rjPort ${occupied ? 'rjPortUsed' : ''} ${shakeMe ? 'shake' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop(pin)}
                    title={`Pin ${pin}`}
                  >
                    <div className="wireEndAnchor" ref={(el) => { bAnchorsRef.current[pin] = el }} />
                    <div className={`rjPortNumber ${occupied ? 'rjPortConnected' : ''}`}>{pin}</div>
                    <div className="small">{occupied ? 'Connected' : 'Drop here'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="small" style={{ marginTop: 6 }}>
          Pins map: 1→3, 2→6, 3→1, 4→7, 5→8, 6→2, 7→4, 8→5.
        </div>
      </div>
    </div>
  )
}
