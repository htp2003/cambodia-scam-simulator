import { useEffect, useReducer, useRef } from 'react'
import {
  BOOT_DELAY_MS,
  EVENT_CHANCE,
  MAX_DAY,
  MAX_NIGHT_ACTIONS,
  SAVE_KEY,
  TYPING_DELAY_MS,
  WORK_END_MINUTES,
} from '@/features/simulator/data/constants'
import { GAME_EVENTS } from '@/features/simulator/data/events'
import { TARGETS } from '@/features/simulator/data/victims'
import {
  addClue,
  applyChoiceEffects,
  applyEventEffects,
  calculateEscapeChance,
  createDayThreeEnding,
  createId,
  createInitialGameState,
  createLog,
  createNextDayState,
  getNightClue,
  isKpiPassed,
  isValidSavedState,
  resolveCollapsedEnding,
} from '@/features/simulator/logic/game-rules'
import { simulatorReducer } from '@/features/simulator/logic/reducer'
import { AudioSynth } from '@/features/simulator/services/audio-synth'
import type {
  EscapeClue,
  GameEvent,
  GameState,
  NightAction,
  TargetProgress,
  UseSimulatorGameResult,
  WorkstationTab,
} from '@/features/simulator/types'

const audioSynth = new AudioSynth()

interface SimulatorHookOptions {
  random?: () => number
  storage?: Storage
}

const getInitialState = (storage?: Storage) => {
  if (!storage) {
    return createInitialGameState()
  }

  try {
    const rawValue = storage.getItem(SAVE_KEY)
    if (!rawValue) {
      return createInitialGameState()
    }

    const parsedValue: unknown = JSON.parse(rawValue)
    if (!isValidSavedState(parsedValue)) {
      storage.removeItem(SAVE_KEY)
      return createInitialGameState()
    }

    return {
      ...parsedValue,
      isBooting: false,
      isTargetTyping: false,
      activeEventId: null,
      toasts: [],
    }
  } catch {
    storage.removeItem(SAVE_KEY)
    return createInitialGameState()
  }
}

const updateTarget = (
  targets: TargetProgress[],
  targetId: string,
  updater: (target: TargetProgress) => TargetProgress,
) => targets.map((target) => (target.id === targetId ? updater(target) : target))

const createTargetClue = (targetId: string): EscapeClue | undefined => {
  const target = TARGETS.find((item) => item.id === targetId)
  if (!target) {
    return undefined
  }

  return {
    id: target.clueId,
    label: target.researchFinding,
    source: 'conversation',
  }
}

export const useSimulatorGame = (
  options: SimulatorHookOptions = {},
): UseSimulatorGameResult => {
  const random = options.random ?? Math.random
  const storage =
    options.storage ?? (typeof window === 'undefined' ? undefined : window.localStorage)
  const [state, dispatch] = useReducer(simulatorReducer, storage, getInitialState)
  const stateRef = useRef(state)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const bootTimeoutRef = useRef<number | null>(null)

  const replaceState = (nextState: GameState) => {
    const stampedState =
      nextState.showDisclaimer || nextState.isBooting
        ? nextState
        : {
            ...nextState,
            lastSavedAt: new Date().toLocaleTimeString(),
          }
    stateRef.current = stampedState
    dispatch({
      type: 'replace',
      state: stampedState,
    })
  }

  const addToast = (
    currentState: GameState,
    text: string,
    type: 'info' | 'success' | 'warning',
  ): GameState => ({
    ...currentState,
    toasts: [
      ...currentState.toasts.slice(-2),
      {
        id: createId('toast'),
        text,
        type,
      },
    ],
  })

  const maybeTriggerEvent = (currentState: GameState): GameState => {
    if (
      currentState.activeEventId ||
      currentState.ending ||
      currentState.isTargetTyping ||
      random() >= EVENT_CHANCE
    ) {
      return currentState
    }

    const eligibleEvents = GAME_EVENTS.filter(
      (event) =>
        event.phase === currentState.phase &&
        event.minimumDay <= currentState.day &&
        !currentState.triggeredEventIds.includes(event.id),
    )
    const event = eligibleEvents[Math.floor(random() * eligibleEvents.length)]

    if (!event) {
      return currentState
    }

    audioSynth.play('alarm')
    return {
      ...currentState,
      activeEventId: event.id,
      triggeredEventIds: [...currentState.triggeredEventIds, event.id],
    }
  }

  const finalizeAction = (nextState: GameState, allowEvent = true) => {
    const ending = resolveCollapsedEnding(nextState)
    const finalizedState = ending
      ? {
          ...nextState,
          phase: 'ended' as const,
          ending,
        }
      : allowEvent
        ? maybeTriggerEvent(nextState)
        : nextState
    replaceState(finalizedState)
  }

  const acceptDisclaimer = () => {
    audioSynth.init()
    audioSynth.play('upgrade')
    const nextState = {
      ...stateRef.current,
      showDisclaimer: false,
      isBooting: true,
    }
    replaceState(nextState)

    bootTimeoutRef.current = window.setTimeout(() => {
      const bootedState = {
        ...stateRef.current,
        isBooting: false,
      }
      replaceState(bootedState)
      bootTimeoutRef.current = null
    }, BOOT_DELAY_MS)
  }

  const selectTab = (tab: WorkstationTab) => {
    audioSynth.play('click')
    replaceState({
      ...stateRef.current,
      activeTab: tab,
    })
  }

  const selectTarget = (targetId: string) => {
    const target = TARGETS.find((item) => item.id === targetId)
    if (!target || stateRef.current.isTargetTyping) {
      return
    }

    audioSynth.play('click')
    replaceState({
      ...stateRef.current,
      activeTargetId: targetId,
      activeTab: 'chat',
    })
  }

  const chooseDialogue = (choiceIndex: number) => {
    const currentState = stateRef.current
    const target = TARGETS.find((item) => item.id === currentState.activeTargetId)
    const targetProgress = currentState.targets.find(
      (item) => item.id === currentState.activeTargetId,
    )

    if (
      !target ||
      !targetProgress ||
      targetProgress.status !== 'active' ||
      currentState.phase !== 'work' ||
      currentState.isTargetTyping
    ) {
      return
    }

    const scene = target.scenes[targetProgress.sceneIndex]
    const choice = scene?.choices[choiceIndex]
    if (!scene || !choice) {
      return
    }

    audioSynth.play(choice.effects.money > 0 ? 'cash' : 'click')
    const playerMessageId = createId('message-player')
    let nextState = applyChoiceEffects(currentState, choice.effects)
    const shouldReport = targetProgress.suspicion + choice.effects.suspicion >= 70
    const nextStatus = shouldReport ? 'reported' : choice.outcome ?? 'active'
    const reportsToAdd = nextStatus === 'reported' ? 1 : 0

    nextState = {
      ...nextState,
      isTargetTyping: true,
      sentSignal: nextState.sentSignal || Boolean(choice.sendsSignal),
      progress: {
        ...nextState.progress,
        reports: nextState.progress.reports + reportsToAdd,
      },
      clues: choice.clueId
        ? addClue(nextState.clues, createTargetClue(target.id))
        : nextState.clues,
      targets: updateTarget(nextState.targets, target.id, (item) => ({
        ...item,
        sceneIndex: choice.nextScene ?? item.sceneIndex,
        status: shouldReport || choice.nextScene === null ? nextStatus : 'active',
        trust: Math.max(0, Math.min(100, item.trust + choice.effects.trust)),
        suspicion: Math.max(0, Math.min(100, item.suspicion + choice.effects.suspicion)),
        moneyCollected: item.moneyCollected + choice.effects.money,
      })),
      chatMessages: [
        ...nextState.chatMessages,
        {
          id: playerMessageId,
          targetId: target.id,
          sender: 'player',
          text: choice.text,
        },
      ],
      logs: [
        ...nextState.logs.slice(-30),
        createLog(
          `${target.name}: ${choice.effects.money > 0 ? `đã chuyển $${choice.effects.money.toLocaleString()}` : 'line vừa đổi hướng'}.`,
          nextState.timeMinutes,
          choice.effects.money > 0 ? 'success' : 'warning',
        ),
      ],
    }

    replaceState(nextState)

    typingTimeoutRef.current = window.setTimeout(() => {
      const latestState = stateRef.current
      const latestProgress = latestState.targets.find((item) => item.id === target.id)
      const response =
        choice.nextScene === null
          ? choice.outcome === 'helped'
            ? 'Tôi hiểu rồi. Tôi sẽ dừng lại và giữ toàn bộ bằng chứng.'
            : latestProgress?.status === 'reported'
              ? 'Tôi đã báo người nhà và sẽ trình báo chuyện này.'
              : 'Đừng liên lạc với tôi nữa.'
          : target.scenes[choice.nextScene]?.targetLine ?? 'Kết nối đã bị ngắt.'
      const stateWithResponse: GameState = {
        ...latestState,
        isTargetTyping: false,
        chatMessages: [
          ...latestState.chatMessages,
          {
            id: createId('message-target'),
            targetId: target.id,
            sender: 'target',
            text: response,
          },
        ],
      }
      finalizeAction(stateWithResponse)
      typingTimeoutRef.current = null
    }, TYPING_DELAY_MS)
  }

  const researchTarget = () => {
    const currentState = stateRef.current
    const target = TARGETS.find((item) => item.id === currentState.activeTargetId)
    const targetProgress = currentState.targets.find((item) => item.id === currentState.activeTargetId)

    if (
      !target ||
      !targetProgress ||
      currentState.phase !== 'work' ||
      currentState.researchedToday.includes(target.id)
    ) {
      return
    }

    audioSynth.play('click')
    const nextState: GameState = {
      ...currentState,
      timeMinutes: Math.min(WORK_END_MINUTES, currentState.timeMinutes + 35),
      stats: {
        ...currentState.stats,
        energy: Math.max(0, currentState.stats.energy - 5),
        risk: Math.min(100, currentState.stats.risk + 4),
      },
      researchedToday: [...currentState.researchedToday, target.id],
      targets: updateTarget(currentState.targets, target.id, (item) => ({
        ...item,
        researched: true,
        trust: Math.min(100, item.trust + 4),
      })),
      logs: [
        ...currentState.logs.slice(-30),
        createLog(`Browser cache: ${target.researchFinding}`, currentState.timeMinutes + 35, 'neutral'),
      ],
    }
    finalizeAction(addToast(nextState, 'Đã lưu hồ sơ target vào workstation.', 'success'))
  }

  const performNightAction = (action: NightAction) => {
    const currentState = stateRef.current
    if (currentState.phase !== 'night' || currentState.nightActionsUsed >= MAX_NIGHT_ACTIONS) {
      return
    }

    audioSynth.play('click')
    let stats = currentState.stats
    let clues = currentState.clues
    let text = ''

    if (action === 'sleep') {
      stats = {
        ...stats,
        energy: Math.min(100, stats.energy + 25),
        mental: Math.min(100, stats.mental + 10),
      }
      text = 'Bạn ngủ được một giấc ngắn giữa tiếng quạt và tiếng khóa cửa.'
    }

    if (action === 'eat') {
      stats = {
        ...stats,
        health: Math.min(100, stats.health + 14),
        cash: Math.max(0, stats.cash - 5),
      }
      text = 'Một phần cơm nguội giúp cơ thể cầm cự thêm một ngày.'
    }

    if (action === 'window') {
      stats = {
        ...stats,
        energy: Math.max(0, stats.energy - 5),
        risk: Math.min(100, stats.risk + 7),
      }
      clues = addClue(clues, getNightClue('window'))
      text = 'Bạn phát hiện camera hành lang mất góc nhìn ngay sát cầu thang.'
    }

    if (action === 'coworker') {
      stats = {
        ...stats,
        mental: Math.max(0, stats.mental - 4),
        risk: Math.min(100, stats.risk + 10),
      }
      clues = addClue(clues, getNightClue('coworker'))
      text = 'Một đồng nghiệp đưa lịch đổi ca rồi yêu cầu bạn đừng nhắc tên họ.'
    }

    const nextState: GameState = {
      ...currentState,
      stats,
      clues,
      nightActionsUsed: currentState.nightActionsUsed + 1,
      incidents: [
        ...currentState.incidents.slice(-20),
        createLog(text, currentState.timeMinutes, action === 'sleep' || action === 'eat' ? 'success' : 'warning'),
      ],
    }
    finalizeAction(addToast(nextState, text, 'info'))
  }

  const endWorkDay = () => {
    const currentState = stateRef.current
    if (currentState.phase !== 'work') {
      return
    }

    audioSynth.play(isKpiPassed(currentState) ? 'upgrade' : 'fail')
    const passed = isKpiPassed(currentState)
    const nextState: GameState = {
      ...currentState,
      phase: 'night',
      activeTab: 'dorm',
      timeMinutes: WORK_END_MINUTES,
      stats: {
        ...currentState.stats,
        health: Math.max(0, currentState.stats.health + (passed ? 0 : -10)),
        mental: Math.max(0, currentState.stats.mental + (passed ? -3 : -12)),
        risk: Math.min(100, currentState.stats.risk + (passed ? 0 : 10)),
        cash: currentState.stats.cash + (passed ? 25 : 0),
      },
      incidents: [
        ...currentState.incidents.slice(-20),
        createLog(
          passed
            ? 'Tony: Đạt KPI. Ngày mai chỉ tiêu sẽ cao hơn.'
            : 'Tony: Trượt KPI. Món nợ của mày vừa tăng.',
          WORK_END_MINUTES,
          passed ? 'success' : 'danger',
        ),
      ],
    }
    finalizeAction(nextState)
  }

  const finishNight = () => {
    const currentState = stateRef.current
    if (currentState.phase !== 'night') {
      return
    }

    audioSynth.play('upgrade')
    if (currentState.day >= MAX_DAY) {
      replaceState({
        ...currentState,
        phase: 'ended',
        ending: createDayThreeEnding(currentState),
      })
      return
    }

    finalizeAction(createNextDayState(currentState), false)
  }

  const chooseEvent = (choiceIndex: number) => {
    const currentState = stateRef.current
    const event = GAME_EVENTS.find((item) => item.id === currentState.activeEventId)
    const choice = event?.choices[choiceIndex]
    if (!event || !choice) {
      return
    }

    audioSynth.play(choice.clue ? 'upgrade' : 'click')
    let nextState = applyEventEffects(currentState, choice.effects)
    nextState = {
      ...nextState,
      activeEventId: null,
      sentSignal: nextState.sentSignal || Boolean(choice.sendsSignal),
      clues: addClue(nextState.clues, choice.clue),
      incidents: [
        ...nextState.incidents.slice(-20),
        createLog(choice.result, nextState.timeMinutes, choice.clue ? 'success' : 'warning'),
      ],
    }
    finalizeAction(nextState, false)
  }

  const tryEscape = () => {
    const currentState = stateRef.current
    if (currentState.clues.length < 2 || currentState.ending) {
      replaceState(addToast(currentState, 'Cần ít nhất 2 manh mối để thử trốn.', 'warning'))
      return
    }

    const chance = calculateEscapeChance(
      currentState.clues.length,
      currentState.stats.risk,
      currentState.sentSignal,
    )
    const escaped = random() * 100 < chance
    audioSynth.play(escaped ? 'upgrade' : 'alarm')
    replaceState({
      ...currentState,
      phase: 'ended',
      ending: escaped
        ? {
            type: 'escaped',
            title: 'FREE',
            description:
              'Bạn rời compound đúng lúc đổi ca. Những bản ghi đã được gửi đi trước khi cánh cổng khép lại.',
          }
        : {
            type: 'caught',
            title: 'FAILED ESCAPE',
            description:
              'Bạn bị phát hiện ở cầu thang. Họ chuyển bạn sang khu khác, nơi cửa khóa kỹ hơn và không còn cửa sổ.',
          },
    })
  }

  const toggleMuted = () => {
    const nextMuted = !stateRef.current.isMuted
    audioSynth.setMuted(nextMuted)
    replaceState({
      ...stateRef.current,
      isMuted: nextMuted,
    })
  }

  const restartGame = () => {
    storage?.removeItem(SAVE_KEY)
    audioSynth.play('upgrade')
    replaceState(createInitialGameState())
  }

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    if (!storage || state.showDisclaimer || state.isBooting) {
      return
    }

    const savedState = {
      ...state,
      lastSavedAt: new Date().toLocaleTimeString(),
      toasts: [],
      isTargetTyping: false,
      activeEventId: null,
    }
    storage.setItem(SAVE_KEY, JSON.stringify(savedState))
  }, [state, storage])

  useEffect(() => {
    if (state.toasts.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      replaceState({
        ...stateRef.current,
        toasts: stateRef.current.toasts.slice(1),
      })
    }, 3200)

    return () => window.clearTimeout(timeoutId)
  }, [state.toasts])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({
      behavior: 'smooth',
    })
  }, [state.chatMessages, state.isTargetTyping])

  useEffect(
    () => () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current)
      }
      if (bootTimeoutRef.current !== null) {
        window.clearTimeout(bootTimeoutRef.current)
      }
    },
    [],
  )

  const activeTarget =
    TARGETS.find((target) => target.id === state.activeTargetId) ?? TARGETS[0]
  const activeTargetProgress =
    state.targets.find((target) => target.id === activeTarget.id) ?? state.targets[0]
  const activeEvent: GameEvent | null =
    GAME_EVENTS.find((event) => event.id === state.activeEventId) ?? null
  const currentScene =
    activeTargetProgress.status === 'active'
      ? activeTarget.scenes[activeTargetProgress.sceneIndex] ?? null
      : null

  return {
    actions: {
      acceptDisclaimer,
      chooseDialogue,
      chooseEvent,
      endWorkDay,
      finishNight,
      performNightAction,
      researchTarget,
      restartGame,
      selectTab,
      selectTarget,
      toggleMuted,
      tryEscape,
    },
    chatEndRef,
    derived: {
      activeEvent,
      activeTarget,
      activeTargetProgress,
      currentScene,
      escapeChance: calculateEscapeChance(
        state.clues.length,
        state.stats.risk,
        state.sentSignal,
      ),
      kpiPassed: isKpiPassed(state),
      warningLevel: state.stats.risk > 70 ? 'HIGH' : state.stats.risk > 40 ? 'MEDIUM' : 'LOW',
    },
    state,
  }
}
