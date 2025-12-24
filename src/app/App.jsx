import React, { useMemo, useRef, useState, useEffect } from 'react'
import PreLanding from './screens/PreLanding'
import Landing from './screens/Landing'
import Personalize from './screens/Personalize'
import GameLevel1 from './screens/GameLevel1'
import GameLevel2 from './screens/GameLevel2'
import GameLevel3 from './screens/GameLevel3'
import GameOver from './screens/GameOver'
import Surprise from './screens/Surprise'
import FinalChoice from './screens/FinalChoice'
import GalaRecommend from './screens/GalaRecommend'
import FoodRecommend from './screens/FoodRecommend'
import FinalScreen from './screens/FinalScreen'

import Modal from './components/Modal'
import { companionEmoji } from './components/CompanionPicker'

import {
  getOrCreateSession,
  getKeys,
  loadAppState,
  logEvent,
  persistAppState,
  setCurrentScreen,
  unlockEasterEgg,
  isEasterEggUnlocked,
  clearEventLog,
  resetPhotoProgress,
  resetSession,
} from '../lib/analytics'
import { sendStartEmailOnce, retryPendingFinalEmailOnce } from '../lib/email'
import { memoryShards } from '../content/messages'

const SCREENS = {
  PRELANDING: 'PRELANDING',
  LANDING: 'LANDING',
  PERSONALIZE: 'PERSONALIZE',
  LEVEL1: 'LEVEL1',
  LEVEL2: 'LEVEL2',
  LEVEL3: 'LEVEL3',
  GAMEOVER: 'GAMEOVER',
  SURPRISE: 'SURPRISE',
  FINAL_CHOICE: 'FINAL_CHOICE',
  GALA_RECOMMEND: 'GALA_RECOMMEND',
  FOOD_RECOMMEND: 'FOOD_RECOMMEND',
  FINAL: 'FINAL',
}

const DEFAULT_STATE = {
  screen: SCREENS.PRELANDING,
  personalization: {
    companion: 'cat',
    vibe: 'Cozy',
    nickname: '',
  },
  game: {
    scoreTotal: 0,
    replayCount: 0,
    level1: { timeSpent: 0, scoreDelta: 0 },
    level2: { timeSpent: 0, attempts: 0, scoreDelta: 0 },
    level3: { timeSpent: 0, mistakes: 0, scoreDelta: 0 },
  },
  finalChoice: '',
  galaPick: '',
  galaSuggestion: '',
  foodPick: '',
  foodSuggestion: '',
}

function useTinySound(soundOn) {
  const ctxRef = useRef(null)

  const pop = () => {
    if (!soundOn) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      if (!ctxRef.current) ctxRef.current = new AudioCtx()
      const ctx = ctxRef.current
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 660
      g.gain.value = 0.0001
      o.connect(g)
      g.connect(ctx.destination)
      const t = ctx.currentTime
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
      o.start()
      o.stop(t + 0.14)
    } catch {
      // ignore
    }
  }

  return pop
}

export default function App() {
  const [appState, setAppState] = useState(() => {
    const saved = loadAppState()
    const initial = saved?.screen
      ? {
          ...DEFAULT_STATE,
          ...saved,
          personalization: { ...DEFAULT_STATE.personalization, ...(saved.personalization || {}) },
          game: { ...DEFAULT_STATE.game, ...(saved.game || {}) },
        }
      : DEFAULT_STATE
    getOrCreateSession()
    setCurrentScreen(initial.screen)
    return initial
  })

  const [memoryModal, setMemoryModal] = useState(null)
  const [secretModal, setSecretModal] = useState(null)
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('cq_soundEnabled') === 'true')
  const [activeTrack, setActiveTrack] = useState(() => localStorage.getItem('cq_activeTrack') || 'quest')
  const questAudioRef = useRef(null)
  const surpriseAudioRef = useRef(null)
  const catTapRef = useRef(0)

  const pop = useTinySound(soundOn)

  const ensureTrack = (track) => {
    const ref = track === 'surprise' ? surpriseAudioRef : questAudioRef
    if (!ref.current) {
      const src = track === 'surprise' ? '/music/surprise.mp3' : '/music/quest.mp3'
      const a = new Audio(src)
      a.loop = true
      a.volume = 0.25
      ref.current = a
    }
    return ref.current
  }

  const pauseAll = () => {
    ;[questAudioRef.current, surpriseAudioRef.current].forEach((a) => {
      if (a) {
        a.pause()
        a.currentTime = 0
      }
    })
  }

  const playTrack = (track) => {
    setActiveTrack(track)
    localStorage.setItem('cq_activeTrack', track)
    if (!soundOn) return
    const target = ensureTrack(track)
    const other = track === 'surprise' ? ensureTrack('quest') : ensureTrack('surprise')
    if (other && other !== target) other.pause()
    target.play().catch(() => {
      const handler = () => {
        target.play().catch(() => { /* ignore */ })
      }
      document.addEventListener('pointerdown', handler, { once: true })
    })
  }

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev
      localStorage.setItem('cq_soundEnabled', next ? 'true' : 'false')
      if (next) playTrack(activeTrack)
      else pauseAll()
      return next
    })
  }

  useEffect(() => {
    // retry pending final email once (silently)
    retryPendingFinalEmailOnce()
  }, [])

  useEffect(() => {
    if (!soundOn) pauseAll()
  }, [soundOn])

  const goTo = (screen) => {
    setCurrentScreen(screen)
    setAppState((prev) => {
      const next = { ...prev, screen }
      persistAppState(next)
      return next
    })
  }

  const updateState = (patchFn) => {
    setAppState((prev) => {
      const next = patchFn(prev)
      persistAppState(next)
      return next
    })
  }

  const openMemory = (idx, nextScreen) => {
    const shard = memoryShards[idx - 1]
    if (!shard) {
      goTo(nextScreen)
      return
    }
    logEvent(`MEMORY${idx}_VIEWED`)
    setMemoryModal({ idx, ...shard, nextScreen })
  }

  const resetGameKeepPersonalization = ({ incrementReplay = false } = {}) => {
    updateState((prev) => {
      const replayCount = incrementReplay ? prev.game.replayCount + 1 : prev.game.replayCount
      return {
        ...prev,
        game: {
          scoreTotal: 0,
          replayCount,
          level1: { timeSpent: 0, scoreDelta: 0 },
          level2: { timeSpent: 0, attempts: 0, scoreDelta: 0 },
          level3: { timeSpent: 0, mistakes: 0, scoreDelta: 0 },
        },
      }
    })
  }

  const buddyEmoji = useMemo(() => companionEmoji(appState.personalization?.companion), [appState.personalization])

  const handleBuddyTap = () => {
    pop()
    if (appState.personalization?.companion !== 'cat') return
    if (isEasterEggUnlocked()) return

    catTapRef.current += 1
    if (catTapRef.current >= 5) {
      unlockEasterEgg()
      logEvent('EASTER_EGG_UNLOCKED')
      setSecretModal({
        title: 'psst… 🐾',
        text: 'If you found this, you officially get 5 bonus kisses. (Redeemable anytime. No expiry.)',
      })
    }
  }

  const handleTryAgain = () => {
    logEvent('FINAL_TRY_AGAIN_CLICK')
    const LS = getKeys()
    localStorage.removeItem(LS.startEmailSent)
    localStorage.removeItem(LS.finalEmailSent)
    localStorage.removeItem(LS.pendingFinalEmail)
    localStorage.removeItem(LS.pendingFinalEmailRetries)
    clearEventLog()
    resetSession()
    resetPhotoProgress()
    pauseAll()
    setActiveTrack('quest')
    localStorage.setItem('cq_activeTrack', 'quest')
    setCurrentScreen(SCREENS.PRELANDING)

    setAppState((prev) => {
      const next = JSON.parse(JSON.stringify(DEFAULT_STATE))
      persistAppState(next)
      return next
    })
  }

  const TopBar = () => {
    if (appState.screen === SCREENS.PRELANDING) return null
    return (
      <div className="topbar">
        <div className="brand">
          <div className="brandMark" role="img" aria-label="Christmas tree">🎄</div>
          <div>
            <div className="brandTitle">Christmas Quest</div>
          </div>
        </div>

        <div className="controls">
          <div className="buddy" onClick={handleBuddyTap} title="tap me (maybe)" role="button" tabIndex={0}>
            <div className="buddyEmoji">{buddyEmoji}</div>
            <div className="buddyText">Companion</div>
          </div>

          <button
            className="btn btnGhost soundToggle"
            onClick={toggleSound}
            aria-pressed={soundOn}
            title="Sound (optional)"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="app" className="app" data-vibe={(appState.personalization?.vibe || 'Cozy').toLowerCase()}>
      <div className="shell">
        <TopBar />

        {appState.screen === SCREENS.PRELANDING && (
          <PreLanding
            onContinue={async () => {
              pop()
              logEvent('PRELANDING_CONTINUE_CLICK')
              await sendStartEmailOnce()
              playTrack('quest')
              goTo(SCREENS.LANDING)
            }}
          />
        )}

        {appState.screen === SCREENS.LANDING && (
          <Landing
            onStart={() => {
              pop()
              logEvent('LANDING_START_CLICK')
              playTrack('quest')
              goTo(SCREENS.PERSONALIZE)
            }}
            onSkip={() => {
              pop()
              logEvent('LANDING_SKIP_CLICK')
              playTrack('surprise')
              goTo(SCREENS.SURPRISE)
            }}
          />
        )}

        {appState.screen === SCREENS.PERSONALIZE && (
          <Personalize
            personalization={appState.personalization}
            onChange={(p) => updateState((prev) => ({ ...prev, personalization: p }))}
            onBegin={() => {
              pop()
              logEvent('PERSONALIZE_SELECTED', { ...appState.personalization })
              resetGameKeepPersonalization({ incrementReplay: false })
              goTo(SCREENS.LEVEL1)
            }}
          />
        )}

        {appState.screen === SCREENS.LEVEL1 && (
          <GameLevel1
            personalization={appState.personalization}
            onComplete={({ scoreDelta, timeSpent }) => {
              updateState((prev) => {
                const scoreTotal = prev.game.scoreTotal + scoreDelta
                return {
                  ...prev,
                  game: {
                    ...prev.game,
                    scoreTotal,
                    level1: { scoreDelta, timeSpent },
                  },
                }
              })
              openMemory(1, SCREENS.LEVEL2)
            }}
          />
        )}

        {appState.screen === SCREENS.LEVEL2 && (
          <GameLevel2
            personalization={appState.personalization}
            onComplete={({ scoreDelta, timeSpent, attempts }) => {
              updateState((prev) => {
                const scoreTotal = prev.game.scoreTotal + scoreDelta
                return {
                  ...prev,
                  game: {
                    ...prev.game,
                    scoreTotal,
                    level2: { scoreDelta, timeSpent, attempts },
                  },
                }
              })
              openMemory(2, SCREENS.LEVEL3)
            }}
          />
        )}

        {appState.screen === SCREENS.LEVEL3 && (
          <GameLevel3
            personalization={appState.personalization}
            onComplete={({ scoreDelta, timeSpent, mistakes }) => {
              updateState((prev) => {
                const scoreTotal = prev.game.scoreTotal + scoreDelta
                return {
                  ...prev,
                  game: {
                    ...prev.game,
                    scoreTotal,
                    level3: { scoreDelta, timeSpent, mistakes },
                  },
                }
              })
              openMemory(3, SCREENS.GAMEOVER)
            }}
          />
        )}

        {appState.screen === SCREENS.GAMEOVER && (
          <GameOver
            personalization={appState.personalization}
            game={appState.game}
            onPlayAgain={() => {
              pop()
              logEvent('PLAY_AGAIN_CLICK')
              resetGameKeepPersonalization({ incrementReplay: true })
              goTo(SCREENS.LEVEL1)
            }}
            onContinue={() => {
              pop()
              logEvent('CONTINUE_TO_SURPRISE_CLICK')
              playTrack('surprise')
              goTo(SCREENS.SURPRISE)
            }}
          />
        )}

        {appState.screen === SCREENS.SURPRISE && (
          <Surprise
            personalization={appState.personalization}
            onContinue={() => {
              pop()
              logEvent('SURPRISE_FLOW_COMPLETE')
              goTo(SCREENS.FINAL_CHOICE)
            }}
          />
        )}

        {appState.screen === SCREENS.FINAL_CHOICE && (
          <FinalChoice
            onChoose={(val) => {
              pop()
              logEvent('FINAL_CHOICE', { value: val })
              updateState((prev) => ({
                ...prev,
                finalChoice: val,
                galaPick: '',
                galaSuggestion: '',
                foodPick: '',
                foodSuggestion: '',
              }))
              goTo(val === 'gala' ? SCREENS.GALA_RECOMMEND : SCREENS.FOOD_RECOMMEND)
            }}
          />
        )}

        {appState.screen === SCREENS.GALA_RECOMMEND && (
          <GalaRecommend
            selection={appState.galaPick}
            suggestion={appState.galaSuggestion}
            onPick={(option) => {
              pop()
              logEvent('GALA_PICK', { option })
              updateState((prev) => ({ ...prev, galaPick: option, finalChoice: 'gala' }))
            }}
            onNext={(suggestionText) => {
              pop()
              logEvent('GALA_NEXT', { suggestionText })
              updateState((prev) => ({ ...prev, galaSuggestion: suggestionText || '', finalChoice: 'gala' }))
              goTo(SCREENS.FINAL)
            }}
          />
        )}

        {appState.screen === SCREENS.FOOD_RECOMMEND && (
          <FoodRecommend
            selection={appState.foodPick}
            suggestion={appState.foodSuggestion}
            onPick={(option) => {
              pop()
              logEvent('FOOD_PICK', { option })
              updateState((prev) => ({ ...prev, foodPick: option, finalChoice: 'food' }))
            }}
            onNext={(suggestionText) => {
              pop()
              logEvent('FOOD_NEXT', { suggestionText })
              updateState((prev) => ({ ...prev, foodSuggestion: suggestionText || '', finalChoice: 'food' }))
              goTo(SCREENS.FINAL)
            }}
          />
        )}

        {appState.screen === SCREENS.FINAL && (
          <FinalScreen
            personalization={appState.personalization}
            game={appState.game}
            finalChoice={appState.finalChoice}
            galaPick={appState.galaPick}
            galaSuggestion={appState.galaSuggestion}
            foodPick={appState.foodPick}
            foodSuggestion={appState.foodSuggestion}
            onTryAgain={handleTryAgain}
          />
        )}

        {memoryModal && (
          <Modal
            title={memoryModal.title}
            primaryText="Next"
            onPrimary={() => {
              pop()
              setMemoryModal(null)
              goTo(memoryModal.nextScreen)
            }}
          >
            {memoryModal.text}
          </Modal>
        )}

        {secretModal && (
          <Modal
            title={secretModal.title}
            primaryText="hehe ok"
            onPrimary={() => {
              pop()
              setSecretModal(null)
            }}
          >
            {secretModal.text}
          </Modal>
        )}
      </div>
    </div>
  )
}




