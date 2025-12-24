import { nowIso, safeJsonParse, uid } from './utils'

const LS = {
  sessionId: 'cq_sessionId',
  startedAt: 'cq_startedAt',
  currentScreen: 'cq_currentScreen',
  events: 'cq_events',
  startEmailSent: 'cq_startEmailSent',
  finalEmailSent: 'cq_finalEmailSent',
  pendingFinalEmail: 'cq_pendingFinalEmail',
  pendingFinalEmailRetries: 'cq_pendingFinalEmailRetries',
  appState: 'cq_appState',
  photoProgress: 'cq_photoProgress',
  easterEggUnlocked: 'cq_easterEggUnlocked',
}

export function getOrCreateSession() {
  let sessionId = localStorage.getItem(LS.sessionId)
  let startedAt = localStorage.getItem(LS.startedAt)

  if (!sessionId) {
    sessionId = uid()
    localStorage.setItem(LS.sessionId, sessionId)
  }
  if (!startedAt) {
    startedAt = nowIso()
    localStorage.setItem(LS.startedAt, startedAt)
  }
  return { sessionId, startedAt }
}

export function setCurrentScreen(screen) {
  localStorage.setItem(LS.currentScreen, screen)
}

export function getCurrentScreen() {
  return localStorage.getItem(LS.currentScreen) || 'UNKNOWN'
}

export function getEvents() {
  return safeJsonParse(localStorage.getItem(LS.events), []) || []
}

export function logEvent(type, data = {}) {
  const { sessionId } = getOrCreateSession()
  const screen = getCurrentScreen()
  const entry = {
    t: nowIso(),
    type,
    data: {
      sessionId,
      screen,
      ...data,
    },
  }
  const events = getEvents()
  events.push(entry)
  localStorage.setItem(LS.events, JSON.stringify(events))
}

export function clearEventLog() {
  localStorage.setItem(LS.events, '[]')
}

export function resetSession() {
  const sessionId = uid()
  const startedAt = nowIso()
  localStorage.setItem(LS.sessionId, sessionId)
  localStorage.setItem(LS.startedAt, startedAt)
  clearEventLog()
  return { sessionId, startedAt }
}

export function setFlag(key, value) {
  localStorage.setItem(key, value ? 'true' : 'false')
}

export function getFlag(key) {
  return localStorage.getItem(key) === 'true'
}

export function getKeys() {
  return { ...LS }
}

export function persistAppState(state) {
  localStorage.setItem(LS.appState, JSON.stringify(state))
}

export function loadAppState() {
  return safeJsonParse(localStorage.getItem(LS.appState), null)
}

export function getPhotoProgress() {
  const fallback = { lastIndex: 0, viewed: [] }
  const p = safeJsonParse(localStorage.getItem(LS.photoProgress), fallback) || fallback
  // normalize
  p.viewed = Array.isArray(p.viewed) ? p.viewed : []
  p.lastIndex = typeof p.lastIndex === 'number' ? p.lastIndex : 0
  return p
}

export function recordPhotoView(index) {
  const p = getPhotoProgress()
  p.lastIndex = index
  if (!p.viewed.includes(index)) p.viewed.push(index)
  localStorage.setItem(LS.photoProgress, JSON.stringify(p))
}

export function resetPhotoProgress() {
  localStorage.setItem(LS.photoProgress, JSON.stringify({ lastIndex: 0, viewed: [] }))
}

export function isEasterEggUnlocked() {
  return getFlag(LS.easterEggUnlocked)
}

export function unlockEasterEgg() {
  setFlag(LS.easterEggUnlocked, true)
}

export function buildSummaryText(summary) {
  const lines = []
  lines.push(`Session: ${summary.sessionId}`)
  lines.push(`Duration: ${summary.durationSeconds}s`)
  lines.push(`Companion: ${summary.companion} | Vibe: ${summary.vibe} | Nickname: ${summary.nickname || '(none)'}`)
  lines.push(`Score: ${summary.scoreTotal} | Replays: ${summary.replayCount}`)
  lines.push(`Final choice: ${summary.finalChoice || '(none)'}`)
  if (summary.finalChoice === 'gala') {
    lines.push(`Gala pick: ${summary.galaPick || '(none)'} | Suggestion: ${summary.galaSuggestion || '(none)'}`)
    lines.push(`She chose Gala and picked ${summary.galaPick || 'no pick'}. Suggestion: ${summary.galaSuggestion || 'none'}.`)
  }
  if (summary.finalChoice === 'food') {
    lines.push(`Food pick: ${summary.foodPick || '(none)'} | Suggestion: ${summary.foodSuggestion || '(none)'}`)
    lines.push(`She chose Food and picked ${summary.foodPick || 'no pick'}. Suggestion: ${summary.foodSuggestion || 'none'}.`)
  }
  lines.push(`Photos viewed: ${summary.photosViewedCount} | Last index: ${summary.lastPhotoIndex}`)

  const last = summary.lastPhotoIndex
  if (typeof last === 'number') {
    lines.push(`Photo progress: reached slide ${last + 1}`)
  }

  lines.push('')
  lines.push('Event log included below (JSON).')
  return lines.join('\n')
}

export function buildFinalSummaryPayload({ personalization, game, finalChoice, finishedAt, galaPick, galaSuggestion, foodPick, foodSuggestion }) {
  const { sessionId, startedAt } = getOrCreateSession()
  const events = getEvents()
  const durationSeconds = Math.max(
    0,
    Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  )
  const photo = getPhotoProgress()

  const payload = {
    subject: 'She finished your Christmas Quest ✅',
    sessionId,
    startedAt,
    finishedAt,
    durationSeconds,
    companion: personalization?.companion || 'cat',
    vibe: personalization?.vibe || 'Cozy',
    nickname: personalization?.nickname || '',
    scoreTotal: game?.scoreTotal ?? 0,
    replayCount: game?.replayCount ?? 0,
    finalChoice: finalChoice || '',
    galaPick: galaPick || '',
    galaSuggestion: galaSuggestion || '',
    foodPick: foodPick || '',
    foodSuggestion: foodSuggestion || '',
    photosViewedCount: photo.viewed.length,
    lastPhotoIndex: photo.lastIndex,
    eventLogJson: JSON.stringify(events, null, 2),
  }

  payload.summaryText = buildSummaryText(payload)

  return payload
}
