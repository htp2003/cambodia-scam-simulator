import { useEffect, useEffectEvent, useReducer, useRef } from 'react'
import {
  ESCAPE_COST,
  FIND_PROGRESS_INTERVAL_MS,
  PASSIVE_TICK_MS,
  RANDOM_EVENT_CHANCE,
  REVEAL_CASE_THRESHOLD,
  REVEAL_CLEAN_MONEY_THRESHOLD,
  TOAST_DURATION_MS,
  VICTIM_TYPING_DELAY_MS,
} from '@/features/simulator/data/constants'
import { RANDOM_EVENTS } from '@/features/simulator/data/events'
import { VICTIMS_DATABASE } from '@/features/simulator/data/victims'
import {
  calculateRiskLevel,
  canUnlockEscapeRoute,
  createBuyUpgradeTransition,
  createDialogueChoiceTransition,
  createDisclaimerTransition,
  createEscapePhaseTransition,
  createEscapeTransition,
  createEventChoiceTransition,
  createLaunderTransition,
  createObservationChoiceTransition,
  createRestartState,
  createRevealAcceptanceTransition,
  createRevealTransition,
  createTickTransition,
  createTitlePromotionTransition,
} from '@/features/simulator/logic/game-rules'
import { simulatorInitialState, simulatorReducer } from '@/features/simulator/logic/reducer'
import { AudioSynth } from '@/features/simulator/services/audio-synth'
import type {
  DialogueNode,
  GameTransition,
  RandomEventDefinition,
  SoundEffect,
  UpgradeKey,
  UseSimulatorGameResult,
  VictimScenario,
} from '@/features/simulator/types'

const audioSynth = new AudioSynth()

interface SimulatorHookOptions {
  random?: () => number
}

const isEventEligible = (state: typeof simulatorInitialState, event: RandomEventDefinition) => {
  const conditions = event.conditions

  if (!conditions) {
    return true
  }

  if (conditions.phases && !conditions.phases.includes(state.phase)) {
    return false
  }

  if (conditions.minimumDirtyMoney !== undefined && state.dirtyMoney < conditions.minimumDirtyMoney) {
    return false
  }

  if (conditions.minimumCleanMoney !== undefined && state.cleanMoney < conditions.minimumCleanMoney) {
    return false
  }

  if (conditions.minimumHeat !== undefined && state.heat < conditions.minimumHeat) {
    return false
  }

  if (conditions.maximumHeat !== undefined && state.heat > conditions.maximumHeat) {
    return false
  }

  if (conditions.minimumSuspicion !== undefined && state.suspicion < conditions.minimumSuspicion) {
    return false
  }

  if (conditions.minimumEvidence !== undefined && state.evidence < conditions.minimumEvidence) {
    return false
  }

  if (conditions.revealTriggered !== undefined && state.revealTriggered !== conditions.revealTriggered) {
    return false
  }

  return true
}

export const useSimulatorGame = (
  options: SimulatorHookOptions = {},
): UseSimulatorGameResult => {
  const random = options.random ?? Math.random
  const [state, dispatch] = useReducer(simulatorReducer, simulatorInitialState)
  const stateRef = useRef(state)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const findIntervalRef = useRef<number | null>(null)
  const victimTypingTimeoutRef = useRef<number | null>(null)
  const trackedToastIdsRef = useRef<Set<string>>(new Set())

  const playSound = (sound?: SoundEffect) => {
    if (sound) {
      audioSynth.play(sound)
    }
  }

  const applyTransition = (transition: GameTransition | null) => {
    if (!transition) {
      return
    }

    dispatch({
      type: 'applyTransition',
      transition,
    })
    playSound(transition.sound)
  }

  const applyTransitionEffect = useEffectEvent((transition: GameTransition | null) => {
    applyTransition(transition)
  })

  const getCurrentVictim = (victimId: string | null): VictimScenario | null => {
    if (!victimId) {
      return null
    }

    return VICTIMS_DATABASE.find((victim) => victim.id === victimId) ?? null
  }

  const triggerVictimDialogue = (victim: VictimScenario, stepIndex: number) => {
    const dialogueNode: DialogueNode | undefined = victim.script[stepIndex]

    if (!dialogueNode) {
      applyTransition({
        changes: {
          activeVictimSession: null,
          isVictimTyping: false,
        },
        appendChatMessages: [
          {
            sender: 'system',
            text: 'Cuộc trò chuyện vừa bị cắt ngang giữa chừng.',
          },
        ],
      })
      return
    }

    applyTransition({
      appendChatMessages: [
        {
          sender: 'scammer',
          text: dialogueNode.scammer,
        },
      ],
    })

    applyTransition({
      changes: {
        isVictimTyping: true,
      },
    })

    victimTypingTimeoutRef.current = window.setTimeout(() => {
      dispatch({
        type: 'applyTransition',
        transition: {
          changes: {
            isVictimTyping: false,
          },
          appendChatMessages: [
            {
              sender: 'victim',
              text: dialogueNode.victim,
            },
          ],
        },
      })
      victimTypingTimeoutRef.current = null
    }, VICTIM_TYPING_DELAY_MS)
  }

  const acceptDisclaimer = () => {
    const transition = createDisclaimerTransition()
    audioSynth.init()
    applyTransition(transition)
  }

  const acceptReveal = () => {
    applyTransition(createRevealAcceptanceTransition())
  }

  const toggleMuted = () => {
    const nextMutedValue = !stateRef.current.isMuted
    audioSynth.setMuted(nextMutedValue)
    dispatch({
      type: 'setMuted',
      isMuted: nextMutedValue,
    })
  }

  const startFindingVictim = () => {
    const currentState = stateRef.current

    if (
      currentState.activeVictimSession ||
      currentState.activeObservationTargetId ||
      currentState.isFinding ||
      currentState.showRevealModal
    ) {
      return
    }

    audioSynth.play('click')
    dispatch({
      type: 'setFinding',
      isFinding: true,
      findProgress: 0,
    })

    const keyboardBoost =
      currentState.upgrades.keyboard.level * (currentState.upgrades.keyboard.findSpeedBonus ?? 2.8)
    const speed = currentState.phase === 'scam' ? 4 + keyboardBoost : 8 + keyboardBoost

    findIntervalRef.current = window.setInterval(() => {
      const latestState = stateRef.current
      const nextProgress = latestState.findProgress + speed

      if (nextProgress < 100) {
        dispatch({
          type: 'setFinding',
          isFinding: true,
          findProgress: nextProgress,
        })
        return
      }

      if (findIntervalRef.current !== null) {
        window.clearInterval(findIntervalRef.current)
        findIntervalRef.current = null
      }

      const candidateVictims =
        latestState.phase === 'scam'
          ? VICTIMS_DATABASE.slice(0, 2)
          : VICTIMS_DATABASE.filter((victim) => !latestState.unlockedClues.includes(victim.clueId))

      const selectionPool = candidateVictims.length > 0 ? candidateVictims : VICTIMS_DATABASE
      const selectedVictim =
        selectionPool[Math.floor(random() * selectionPool.length)] ?? selectionPool[0]

      if (latestState.phase === 'scam') {
        dispatch({
          type: 'applyTransition',
          transition: {
            changes: {
              activeObservationTargetId: null,
              activeVictimSession: {
                victimId: selectedVictim.id,
                stepIndex: 0,
              },
              findProgress: 0,
              isFinding: false,
              isVictimTyping: false,
            },
            replaceChatMessages: [
              {
                sender: 'system',
                text: `Line mới đã mở: ${selectedVictim.name} - ${selectedVictim.type}.`,
              },
            ],
          },
        })

        triggerVictimDialogue(selectedVictim, 0)
        return
      }

      dispatch({
        type: 'applyTransition',
        transition: {
          changes: {
            activeObservationTargetId: selectedVictim.id,
            activeVictimSession: null,
            findProgress: 0,
            isFinding: false,
            isVictimTyping: false,
          },
          replaceChatMessages: [
            {
              sender: 'system',
              text: `Bạn mở một “cage” mới: ${selectedVictim.name}.`,
            },
            {
              sender: 'system',
              text: selectedVictim.observationPrompt,
            },
            {
              sender: 'victim',
              text: selectedVictim.observationVictimLine,
            },
          ],
        },
      })
    }, FIND_PROGRESS_INTERVAL_MS)
  }

  const selectDialogueOption = (choiceIndex: number) => {
    const currentState = stateRef.current
    const activeVictimSession = currentState.activeVictimSession

    if (!activeVictimSession || currentState.isVictimTyping) {
      return
    }

    const currentVictim = getCurrentVictim(activeVictimSession.victimId)

    if (!currentVictim) {
      return
    }

    audioSynth.play('click')
    const transition = createDialogueChoiceTransition({
      choiceIndex,
      roll: random() * 100,
      state: currentState,
      victim: currentVictim,
    })

    applyTransition(transition)

    const nextVictimSession = transition.changes?.activeVictimSession

    if (nextVictimSession && nextVictimSession.victimId === currentVictim.id) {
      triggerVictimDialogue(currentVictim, nextVictimSession.stepIndex)
    }
  }

  const selectObservationChoice = (choiceIndex: number) => {
    const currentState = stateRef.current
    const currentVictim = getCurrentVictim(currentState.activeObservationTargetId)

    if (!currentVictim) {
      return
    }

    const selectedChoice = currentVictim.observationChoices[choiceIndex]

    if (!selectedChoice) {
      return
    }

    audioSynth.play('click')
    applyTransition(createObservationChoiceTransition(currentState, currentVictim, selectedChoice))
  }

  const launderDirtyMoney = () => {
    const transition = createLaunderTransition(stateRef.current)
    if (!transition.sound) {
      audioSynth.play('click')
    }
    applyTransition(transition)
  }

  const buyUpgrade = (key: UpgradeKey) => {
    audioSynth.play('click')
    applyTransition(createBuyUpgradeTransition(stateRef.current, key))
  }

  const resolveActiveEventChoice = (choiceIndex: number) => {
    const currentState = stateRef.current
    const activeEvent = RANDOM_EVENTS.find((event) => event.id === currentState.activeEventId)

    if (!activeEvent) {
      return
    }

    const selectedChoice = activeEvent.choices[choiceIndex]

    if (!selectedChoice) {
      return
    }

    applyTransition(createEventChoiceTransition(currentState, selectedChoice, Date.now()))
  }

  const escapeBorder = () => {
    audioSynth.play('click')
    applyTransition(createEscapeTransition(stateRef.current))
  }

  const restartGame = () => {
    if (findIntervalRef.current !== null) {
      window.clearInterval(findIntervalRef.current)
      findIntervalRef.current = null
    }

    if (victimTypingTimeoutRef.current !== null) {
      window.clearTimeout(victimTypingTimeoutRef.current)
      victimTypingTimeoutRef.current = null
    }

    audioSynth.play('upgrade')
    dispatch({
      type: 'replaceState',
      state: createRestartState(stateRef.current),
    })
  }

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!state.hasStarted || state.gameOverType) {
      return
    }

    const intervalId = window.setInterval(() => {
      applyTransitionEffect(createTickTransition(stateRef.current))

      const latestState = stateRef.current

      if (latestState.activeEventId || latestState.showRevealModal) {
        return
      }

      const eventPool = RANDOM_EVENTS.filter((event) => isEventEligible(latestState, event))

      if (eventPool.length > 0 && random() < RANDOM_EVENT_CHANCE) {
        const randomEvent = eventPool[Math.floor(random() * eventPool.length)] ?? eventPool[0]
        dispatch({
          type: 'setActiveEvent',
          eventId: randomEvent.id,
        })
        audioSynth.play('alarm')
      }
    }, PASSIVE_TICK_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [applyTransitionEffect, random, state.gameOverType, state.hasStarted])

  useEffect(() => {
    const transition = createTitlePromotionTransition(state)

    if (transition) {
      applyTransitionEffect(transition)
    }
  }, [applyTransitionEffect, state])

  useEffect(() => {
    if (
      state.activeEventId ||
      state.revealTriggered ||
      state.phase !== 'scam' ||
      state.showRevealModal ||
      state.completedCaseCount < REVEAL_CASE_THRESHOLD ||
      state.cleanMoney < REVEAL_CLEAN_MONEY_THRESHOLD
    ) {
      return
    }

    applyTransitionEffect(createRevealTransition())
  }, [
    applyTransitionEffect,
    state.activeEventId,
    state.cleanMoney,
    state.completedCaseCount,
    state.phase,
    state.revealTriggered,
    state.showRevealModal,
  ])

  useEffect(() => {
    if (state.phase !== 'surveillance' || !canUnlockEscapeRoute(state)) {
      return
    }

    applyTransitionEffect(createEscapePhaseTransition())
  }, [applyTransitionEffect, state])

  useEffect(() => {
    for (const toast of state.toasts) {
      if (trackedToastIdsRef.current.has(toast.id)) {
        continue
      }

      trackedToastIdsRef.current.add(toast.id)

      window.setTimeout(() => {
        trackedToastIdsRef.current.delete(toast.id)
        dispatch({
          type: 'removeToast',
          id: toast.id,
        })
      }, TOAST_DURATION_MS)
    }
  }, [state.toasts])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [state.chatMessages, state.isVictimTyping])

  useEffect(() => {
    return () => {
      if (findIntervalRef.current !== null) {
        window.clearInterval(findIntervalRef.current)
      }

      if (victimTypingTimeoutRef.current !== null) {
        window.clearTimeout(victimTypingTimeoutRef.current)
      }
    }
  }, [])

  const currentVictim = getCurrentVictim(
    state.activeVictimSession?.victimId ?? state.activeObservationTargetId,
  )
  const currentDialogue =
    state.phase === 'scam' && currentVictim && state.activeVictimSession
      ? currentVictim.script[state.activeVictimSession.stepIndex] ?? null
      : null
  const activeEvent = RANDOM_EVENTS.find((event) => event.id === state.activeEventId) ?? null

  return {
    actions: {
      acceptDisclaimer,
      acceptReveal,
      buyUpgrade,
      escapeBorder,
      launderDirtyMoney,
      resolveActiveEventChoice,
      restartGame,
      selectDialogueOption,
      selectObservationChoice,
      startFindingVictim,
      toggleMuted,
    },
    chatEndRef,
    derived: {
      activeClues: state.unlockedClues,
      activeEvent,
      canEscape:
        state.phase === 'escape' &&
        canUnlockEscapeRoute(state) &&
        state.cleanMoney >= ESCAPE_COST,
      currentDialogue,
      currentVictim,
      riskLevel: calculateRiskLevel(state),
    },
    state,
  }
}
