import React from 'react'

const companions = [
  { key: 'cat', label: 'Cat', emoji: '🐱' },
  { key: 'bunny', label: 'Bunny', emoji: '🐰' },
  { key: 'penguin', label: 'Penguin', emoji: '🐧' },
]

export default function CompanionPicker({ value = 'cat', onChange }) {
  return (
    <div className="row">
      {companions.map((c) => {
        const active = c.key === value
        return (
          <div
            key={c.key}
            className={`pill ${active ? 'pillActive' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onChange?.(c.key)}
            onKeyDown={(e) => (e.key === 'Enter' ? onChange?.(c.key) : null)}
          >
            <span style={{ fontSize: 18 }}>{c.emoji}</span>
            <span>{c.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function companionEmoji(key) {
  return companions.find(c => c.key === key)?.emoji || '🐱'
}
