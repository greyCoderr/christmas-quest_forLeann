import { getFlag, getKeys, getOrCreateSession, logEvent, setFlag } from './analytics'
import { getTimezone, nowIso, safeJsonParse } from './utils'

function getEnv() {
  const e = import.meta.env
  return {
    publicKey: e.VITE_EMAILJS_PUBLIC_KEY,
    serviceId: e.VITE_EMAILJS_SERVICE_ID,
    templateStart: e.VITE_EMAILJS_TEMPLATE_ID_START,
    templateFinal: e.VITE_EMAILJS_TEMPLATE_ID_FINAL,
    toEmail: e.VITE_NOTIFY_TO_EMAIL,
    toName: e.VITE_NOTIFY_TO_NAME,
  }
}

function validateConfig(requiredKeys, env) {
  const missing = requiredKeys.filter((k) => !env[k])
  if (missing.length) {
    console.error('[emailjs] missing config', missing)
    return { ok: false, missing }
  }
  return { ok: true, missing: [] }
}

function getEmailJsGlobal() {
  if (typeof window === 'undefined') return null
  return window.emailjs || null
}

let emailJsInitialized = false

function ensureEmailJsInit(emailjs, publicKey) {
  if (emailJsInitialized || !emailjs?.init || !publicKey) return
  try {
    emailjs.init({ publicKey })
    emailJsInitialized = true
  } catch {
    // ignore init failures; legacy send call will still be attempted
  }
}

async function trySendWithEmailJs(emailjs, serviceId, templateId, params, publicKey) {
  // v4: emailjs.send(serviceId, templateId, params, { publicKey })
  try {
    ensureEmailJsInit(emailjs, publicKey)
    return await emailjs.send(serviceId, templateId, params, { publicKey })
  } catch (e) {
    // older signature: emailjs.send(serviceId, templateId, params, publicKey)
    return await emailjs.send(serviceId, templateId, params, publicKey)
  }
}

export async function sendStartEmailOnce() {
  const LS = getKeys()
  if (getFlag(LS.startEmailSent)) return

  const env = getEnv()
  console.log('[emailjs] start send attempt', {
    hasKey: !!env.publicKey,
    hasService: !!env.serviceId,
    hasTemplate: !!env.templateStart,
  })
  const config = validateConfig(['publicKey', 'serviceId', 'templateStart'], env)
  if (!config.ok) {
    // silently skip if not configured
    logEvent('EMAIL_START_SKIPPED_NOT_CONFIGURED')
    setFlag(LS.startEmailSent, true) // avoid endless attempts if you forgot env vars
    return
  }

  const emailjs = getEmailJsGlobal()
  if (!emailjs) {
    logEvent('EMAIL_START_SKIPPED_NO_EMAILJS')
    setFlag(LS.startEmailSent, true)
    return
  }

  const { sessionId, startedAt } = getOrCreateSession()
  const params = {
    subject: 'She opened your Christmas Quest dYZ,',
    sessionId,
    startedAt,
    userAgent: navigator.userAgent,
    referrer: document.referrer || '',
    timezone: getTimezone(),
    to_email: env.toEmail || undefined,
    to_name: env.toName || undefined,
  }

  try {
    await trySendWithEmailJs(emailjs, env.serviceId, env.templateStart, params, env.publicKey)
    console.log('[emailjs] send ok')
    setFlag(LS.startEmailSent, true)
  } catch (err) {
    // Don't break UX
    console.warn('[emailjs] send failed', err)
    logEvent('EMAIL_START_FAILED', { error: String(err?.message || err) })
    setFlag(LS.startEmailSent, true) // still only once per session
  }
}

export async function sendFinalEmailOnceOrQueue(payload) {
  const LS = getKeys()
  if (getFlag(LS.finalEmailSent)) return

  const env = getEnv()
  console.log('[emailjs] final send attempt', {
    hasKey: !!env.publicKey,
    hasService: !!env.serviceId,
    hasTemplate: !!env.templateFinal,
  })
  const config = validateConfig(['publicKey', 'serviceId', 'templateFinal'], env)
  if (!config.ok) {
    logEvent('EMAIL_FINAL_SKIPPED_NOT_CONFIGURED')
    setFlag(LS.finalEmailSent, true)
    return
  }

  const emailjs = getEmailJsGlobal()
  if (!emailjs) {
    // queue for retry
    queuePendingFinalEmail(payload)
    return
  }

  try {
    const params = {
      ...payload,
      subject: payload.subject || 'She finished your Christmas Quest バ.',
      to_email: env.toEmail || undefined,
      to_name: env.toName || undefined,
    }
    await trySendWithEmailJs(emailjs, env.serviceId, env.templateFinal, params, env.publicKey)
    console.log('[emailjs] send ok')
    setFlag(LS.finalEmailSent, true)
    localStorage.removeItem(LS.pendingFinalEmail)
    localStorage.removeItem(LS.pendingFinalEmailRetries)
  } catch (err) {
    console.warn('[emailjs] send failed', err)
    logEvent('EMAIL_FINAL_FAILED', { error: String(err?.message || err) })
    queuePendingFinalEmail(payload)
  }
}

function queuePendingFinalEmail(payload) {
  const LS = getKeys()
  try {
    localStorage.setItem(LS.pendingFinalEmail, JSON.stringify({ queuedAt: nowIso(), payload }))
    if (!localStorage.getItem(LS.pendingFinalEmailRetries)) localStorage.setItem(LS.pendingFinalEmailRetries, '0')
  } catch {
    // ignore
  }
}

export async function retryPendingFinalEmailOnce() {
  const LS = getKeys()
  if (getFlag(LS.finalEmailSent)) return

  const retries = Number(localStorage.getItem(LS.pendingFinalEmailRetries) || '0')
  if (retries >= 1) return

  const raw = localStorage.getItem(LS.pendingFinalEmail)
  if (!raw) return

  const pending = safeJsonParse(raw, null)
  if (!pending?.payload) return

  const env = getEnv()
  const emailjs = getEmailJsGlobal()
  if (!validateConfig(['publicKey', 'serviceId', 'templateFinal'], env).ok || !emailjs) {
    // can't retry
    localStorage.setItem(LS.pendingFinalEmailRetries, String(retries + 1))
    return
  }

  try {
    await trySendWithEmailJs(emailjs, env.serviceId, env.templateFinal, pending.payload, env.publicKey)
    console.log('[emailjs] send ok')
    setFlag(LS.finalEmailSent, true)
    localStorage.removeItem(LS.pendingFinalEmail)
    localStorage.removeItem(LS.pendingFinalEmailRetries)
    logEvent('EMAIL_FINAL_RETRY_SUCCESS')
  } catch (err) {
    console.warn('[emailjs] send failed', err)
    localStorage.setItem(LS.pendingFinalEmailRetries, String(retries + 1))
    logEvent('EMAIL_FINAL_RETRY_FAILED', { error: String(err?.message || err) })
  }
}
