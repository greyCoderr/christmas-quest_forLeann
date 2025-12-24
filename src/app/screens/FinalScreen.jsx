import React, { useEffect } from 'react'
import Modal from '../components/Modal'
import { buildFinalSummaryPayload, logEvent } from '../../lib/analytics'
import { sendFinalEmailOnceOrQueue } from '../../lib/email'
import { nowIso } from '../../lib/utils'

export default function FinalScreen({
  personalization,
  game,
  finalChoice,
  galaPick,
  galaSuggestion,
  foodPick,
  foodSuggestion,
  onTryAgain,
}) {
  useEffect(() => {
    logEvent('FLOW_FINISHED')
    const finishedAt = nowIso()
    const payload = buildFinalSummaryPayload({
      personalization,
      game,
      finalChoice,
      galaPick,
      galaSuggestion,
      foodPick,
      foodSuggestion,
      finishedAt,
    })
    sendFinalEmailOnceOrQueue(payload)
  }, [])

  return (
    <Modal
      primaryText="Mwaa!"
      hideHeader
      actionsAlign="center"
      onPrimary={onTryAgain}
    >
      <div
        className="title"
        style={{
          textAlign: 'center',
          marginBottom: 10,
          fontSize: 'clamp(22px, 5vw, 32px)',
          lineHeight: 1.2,
          letterSpacing: '0.2px',
        }}
      >
        Merry Christmas, my dearestt! Ilysm!
      </div>
      <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 8, lineHeight: 1.55 }}>
        If someday you're left with nothing but darkness, <br/>
        I will gather up all the arays of light within me, <br/>
        And mould them into a moon and place it gently in your sky.
      </p>
    </Modal>
  )
}
