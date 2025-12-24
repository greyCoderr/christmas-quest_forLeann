import React, { useEffect, useMemo, useState } from 'react'
import { photos } from '../../content/photos'
import { logEvent, recordPhotoView } from '../../lib/analytics'

export default function PhotoCarousel({ onFinished }) {
  const [index, setIndex] = useState(0)
  const [broken, setBroken] = useState(false)

  const total = photos.length
  const current = useMemo(() => photos[index], [index])

  useEffect(() => {
    recordPhotoView(index)
    logEvent('PHOTO_VIEW', { index })
  }, [index])

  const canBack = index > 0
  const canNext = index < total - 1

  const goBack = () => {
    if (!canBack) return
    setBroken(false)
    logEvent('PHOTO_BACK', { index })
    setIndex((i) => i - 1)
  }

  const goNext = () => {
    if (canNext) {
      setBroken(false)
      logEvent('PHOTO_NEXT', { index })
      setIndex((i) => i + 1)
    } else {
      onFinished?.()
    }
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="badge">📸 <span className="small">Photo {index + 1} of {total}</span></div>
        <div className="small">Swipe your heart slowly ✨</div>
      </div>

      <div className="photoFrame">
        {!broken ? (
          <img
            src={current?.src}
            alt={current?.caption || `Photo ${index + 1}`}
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="panel" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42 }}>🖼️</div>
            <div className="subtitle" style={{ marginTop: 6 }}>Photo not found yet — add it in <code>src/content/photos.js</code></div>
          </div>
        )}
      </div>

      <div className="subtitle">{current?.caption}</div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn btnGhost" onClick={goBack} disabled={!canBack} style={{ opacity: canBack ? 1 : 0.5 }}>
          ← Back
        </button>
        <button className="btn btnPrimary" onClick={goNext}>
          {canNext ? 'Next →' : 'Finish'}
        </button>
      </div>
    </div>
  )
}
