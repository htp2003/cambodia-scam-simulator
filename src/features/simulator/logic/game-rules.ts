import {
  MAX_DAY,
  NIGHT_CLUES,
  SAVE_VERSION,
  WORK_END_MINUTES,
  WORK_START_MINUTES,
} from '@/features/simulator/data/constants'
import { TARGETS } from '@/features/simulator/data/victims'
import type {
  ChoiceEffects,
  EscapeClue,
  EventEffects,
  GameEnding,
  GameState,
  LogEntry,
  PlayerStats,
  TargetProgress,
} from '@/features/simulator/types'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

let idSequence = 0

export const createId = (prefix: string) => `${prefix}-${Date.now()}-${idSequence++}`

export const formatTime = (minutes: number) => {
  const normalized = Math.min(minutes, 23 * 60 + 59)
  const hours = Math.floor(normalized / 60)
  const remainder = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export const createLog = (
  text: string,
  timeMinutes: number,
  tone: LogEntry['tone'] = 'neutral',
): LogEntry => ({
  id: createId('log'),
  text,
  time: formatTime(timeMinutes),
  tone,
})

export const createTargetProgress = (): TargetProgress[] =>
  TARGETS.map((target) => ({
    id: target.id,
    sceneIndex: 0,
    researched: false,
    status: 'active',
    trust: 20,
    suspicion: 10,
    moneyCollected: 0,
  }))

export const createInitialGameState = (): GameState => ({
  saveVersion: SAVE_VERSION,
  day: 1,
  timeMinutes: WORK_START_MINUTES,
  phase: 'work',
  activeTab: 'chat',
  activeTargetId: TARGETS[0].id,
  stats: {
    health: 80,
    energy: 75,
    mental: 72,
    guilt: 20,
    empathy: 55,
    risk: 15,
    cash: 20,
  },
  kpi: {
    money: 3000,
    messages: 24,
    reportsMax: 3,
  },
  progress: {
    money: 0,
    messages: 0,
    reports: 0,
  },
  targets: createTargetProgress(),
  chatMessages: [],
  clues: [],
  logs: [
    createLog('System boot completed. Workstation A-102 authenticated.', WORK_START_MINUTES),
  ],
  incidents: [
    createLog('Tony: KPI hôm nay không có lý do để thấp.', WORK_START_MINUTES, 'warning'),
  ],
  toasts: [],
  nightActionsUsed: 0,
  researchedToday: [],
  triggeredEventIds: [],
  sentSignal: false,
  showDisclaimer: true,
  isBooting: false,
  isMuted: false,
  isTargetTyping: false,
  activeEventId: null,
  ending: null,
  lastSavedAt: null,
})

const applyStats = (
  stats: PlayerStats,
  values: Pick<
    ChoiceEffects | EventEffects,
    'health' | 'energy' | 'mental' | 'guilt' | 'empathy' | 'risk'
  > & { cash?: number },
): PlayerStats => ({
  health: clamp(stats.health + values.health),
  energy: clamp(stats.energy + values.energy),
  mental: clamp(stats.mental + values.mental),
  guilt: clamp(stats.guilt + values.guilt),
  empathy: clamp(stats.empathy + values.empathy),
  risk: clamp(stats.risk + values.risk),
  cash: Math.max(0, stats.cash + (values.cash ?? 0)),
})

export const applyChoiceEffects = (state: GameState, values: ChoiceEffects): GameState => ({
  ...state,
  timeMinutes: Math.min(WORK_END_MINUTES, state.timeMinutes + values.minutes),
  stats: applyStats(state.stats, values),
  progress: {
    money: Math.max(0, state.progress.money + values.money),
    messages: Math.max(0, state.progress.messages + values.messages),
    reports: state.progress.reports,
  },
})

export const applyEventEffects = (state: GameState, values: EventEffects): GameState => ({
  ...state,
  timeMinutes: Math.min(WORK_END_MINUTES, state.timeMinutes + values.minutes),
  stats: applyStats(state.stats, values),
  progress: {
    money: Math.max(0, state.progress.money + values.money),
    messages: Math.max(0, state.progress.messages + values.messages),
    reports: Math.max(0, state.progress.reports + values.reports),
  },
})

export const addClue = (clues: EscapeClue[], clue?: EscapeClue): EscapeClue[] => {
  if (!clue || clues.some((item) => item.id === clue.id)) {
    return clues
  }

  return [...clues, clue]
}

export const calculateEscapeChance = (
  clueCount: number,
  risk: number,
  sentSignal: boolean,
) => Math.max(5, Math.min(95, clueCount * 25 - Math.floor(risk / 3) + (sentSignal ? 15 : 0)))

export const isKpiPassed = (state: GameState) =>
  state.progress.money >= state.kpi.money &&
  state.progress.messages >= state.kpi.messages &&
  state.progress.reports <= state.kpi.reportsMax

export const resolveCollapsedEnding = (state: GameState): GameEnding | null => {
  if (state.stats.health > 0 && state.stats.mental > 0) {
    return null
  }

  return {
    type: 'collapsed',
    title: 'GỤC TRONG CA TRỰC',
    description:
      'Cơ thể hoặc tinh thần của bạn không chịu thêm được nữa. Căn phòng vẫn sáng đèn khi bạn bị kéo khỏi bàn.',
  }
}

export const createNextDayState = (state: GameState): GameState => ({
  ...state,
  day: state.day + 1,
  timeMinutes: WORK_START_MINUTES,
  phase: 'work',
  activeTab: 'chat',
  progress: {
    money: 0,
    messages: 0,
    reports: 0,
  },
  kpi: {
    money: state.kpi.money + 900,
    messages: state.kpi.messages + 7,
    reportsMax: state.kpi.reportsMax,
  },
  targets: createTargetProgress(),
  chatMessages: [],
  nightActionsUsed: 0,
  researchedToday: [],
  activeEventId: null,
  logs: [
    createLog(
      `Ngày ${state.day + 1} bắt đầu. KPI đã được nâng mà không cần giải thích.`,
      WORK_START_MINUTES,
      'warning',
    ),
  ],
})

export const createDayThreeEnding = (state: GameState): GameEnding => {
  if (state.stats.empathy < 30 && state.progress.money >= state.kpi.money) {
    return {
      type: 'manager',
      title: 'THE MANAGER',
      description:
        'Bạn sống sót bằng cách trở thành một phần của bộ máy. Một bàn mới được kê cho bạn, lần này quay mặt về phía những người khác.',
    }
  }

  return {
    type: 'trapped',
    title: 'STILL TRAPPED',
    description:
      'Ba ngày trôi qua. Bạn chưa thoát, nhưng những manh mối vẫn còn được giấu kỹ. Hy vọng chưa biến mất, chỉ bị khóa sau một cánh cửa khác.',
  }
}

export const getNightClue = (action: 'window' | 'coworker') => NIGHT_CLUES[action]

export const isValidSavedState = (value: unknown): value is GameState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<GameState>
  return (
    candidate.saveVersion === SAVE_VERSION &&
    typeof candidate.day === 'number' &&
    typeof candidate.timeMinutes === 'number' &&
    Array.isArray(candidate.targets) &&
    Array.isArray(candidate.clues) &&
    typeof candidate.stats === 'object' &&
    candidate.stats !== null
  )
}

export const canStartNextDay = (state: GameState) => state.day < MAX_DAY
