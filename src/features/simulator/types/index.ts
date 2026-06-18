import type { RefObject } from 'react'

export type DayPhase = 'work' | 'night' | 'ended'

export type WorkstationTab = 'chat' | 'browser' | 'dorm' | 'escape' | 'report'

export type TargetStatus = 'active' | 'closed' | 'helped' | 'reported'

export type ChatSender = 'system' | 'player' | 'target'

export type ToastType = 'info' | 'success' | 'warning'

export type SoundEffect = 'click' | 'cash' | 'alarm' | 'upgrade' | 'fail'

export type PlayerStatKey =
  | 'health'
  | 'energy'
  | 'mental'
  | 'guilt'
  | 'empathy'
  | 'risk'

export interface PlayerStats {
  health: number
  energy: number
  mental: number
  guilt: number
  empathy: number
  risk: number
  cash: number
}

export interface DailyKpi {
  money: number
  messages: number
  reportsMax: number
}

export interface DailyProgress {
  money: number
  messages: number
  reports: number
}

export interface ChoiceEffects {
  money: number
  messages: number
  trust: number
  suspicion: number
  risk: number
  guilt: number
  empathy: number
  energy: number
  health: number
  mental: number
  minutes: number
}

export interface DialogueChoice {
  text: string
  effects: ChoiceEffects
  nextScene: number | null
  outcome?: Exclude<TargetStatus, 'active'>
  clueId?: string
  sendsSignal?: boolean
}

export interface DialogueScene {
  playerLine: string
  targetLine: string
  choices: DialogueChoice[]
}

export interface TargetDefinition {
  id: string
  name: string
  avatar: string
  age: number
  job: string
  location: string
  difficulty: string
  description: string
  weakness: string
  redFlags: string[]
  researchFinding: string
  clueId: string
  scenes: DialogueScene[]
}

export interface TargetProgress {
  id: string
  sceneIndex: number
  researched: boolean
  status: TargetStatus
  trust: number
  suspicion: number
  moneyCollected: number
}

export interface EscapeClue {
  id: string
  label: string
  source: 'conversation' | 'research' | 'night' | 'event'
}

export interface ChatMessage {
  id: string
  targetId: string
  sender: ChatSender
  text: string
}

export interface LogEntry {
  id: string
  text: string
  time: string
  tone: 'neutral' | 'danger' | 'success' | 'warning'
}

export interface ToastItem {
  id: string
  text: string
  type: ToastType
}

export interface EventEffects {
  health: number
  energy: number
  mental: number
  guilt: number
  empathy: number
  risk: number
  cash: number
  money: number
  messages: number
  reports: number
  minutes: number
}

export interface EventChoice {
  text: string
  result: string
  effects: EventEffects
  clue?: EscapeClue
  sendsSignal?: boolean
}

export interface GameEvent {
  id: string
  title: string
  description: string
  minimumDay: number
  phase: DayPhase
  choices: EventChoice[]
}

export type GameEndingType =
  | 'escaped'
  | 'caught'
  | 'collapsed'
  | 'manager'
  | 'trapped'

export interface GameEnding {
  type: GameEndingType
  title: string
  description: string
}

export interface GameState {
  saveVersion: 2
  day: number
  timeMinutes: number
  phase: DayPhase
  activeTab: WorkstationTab
  activeTargetId: string
  stats: PlayerStats
  kpi: DailyKpi
  progress: DailyProgress
  targets: TargetProgress[]
  chatMessages: ChatMessage[]
  clues: EscapeClue[]
  logs: LogEntry[]
  incidents: LogEntry[]
  toasts: ToastItem[]
  nightActionsUsed: number
  researchedToday: string[]
  triggeredEventIds: string[]
  sentSignal: boolean
  showDisclaimer: boolean
  isBooting: boolean
  isMuted: boolean
  isTargetTyping: boolean
  activeEventId: string | null
  ending: GameEnding | null
  lastSavedAt: string | null
}

export interface SimulatorDerivedState {
  activeEvent: GameEvent | null
  activeTarget: TargetDefinition
  activeTargetProgress: TargetProgress
  currentScene: DialogueScene | null
  escapeChance: number
  kpiPassed: boolean
  warningLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface SimulatorActions {
  acceptDisclaimer: () => void
  chooseDialogue: (choiceIndex: number) => void
  chooseEvent: (choiceIndex: number) => void
  endWorkDay: () => void
  finishNight: () => void
  performNightAction: (action: NightAction) => void
  researchTarget: () => void
  restartGame: () => void
  selectTab: (tab: WorkstationTab) => void
  selectTarget: (targetId: string) => void
  toggleMuted: () => void
  tryEscape: () => void
}

export type NightAction = 'sleep' | 'eat' | 'window' | 'coworker'

export interface UseSimulatorGameResult {
  actions: SimulatorActions
  chatEndRef: RefObject<HTMLDivElement | null>
  derived: SimulatorDerivedState
  state: GameState
}
