import React from 'react'

export default function Modal({
  title,
  children,
  primaryText = 'Next',
  onPrimary,
  secondaryText,
  onSecondary,
  hideHeader = false,
  actionsAlign = 'flex-end',
}) {
  const showHeader = !hideHeader && (title || secondaryText)
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modal">
        {showHeader ? (
          <div className="modalHeader">
            <div className="modalTitle">{title}</div>
            {secondaryText ? (
              <button className="btn btnGhost" onClick={onSecondary}>{secondaryText}</button>
            ) : null}
          </div>
        ) : null}
        <div style={{ marginTop: 12, color: 'var(--muted)', lineHeight: 1.55 }}>
          {children}
        </div>
        <div className="row" style={{ justifyContent: actionsAlign, marginTop: 18 }}>
          <button className="btn btnPrimary" onClick={onPrimary}>{primaryText}</button>
        </div>
      </div>
    </div>
  )
}
