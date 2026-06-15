import type { RefObject } from 'react'

export type ChatSender = 'system' | 'scammer' | 'victim'

export type ToastType = 'info' | 'success' | 'warning'

export type Currency = 'dirty' | 'clean'

export type SoundEffect = 'click' | 'cash' | 'alarm' | 'upgrade' | 'fail'

export type GamePhase = 'scam' | 'surveillance' | 'escape'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type GameOverType = 'raid' | 'exposed' | 'burnout' | 'win' | null

export type UpgradeKey =
  | 'keyboard'
  | 'vpn'
  | 'audioRecorder'
  | 'screenDimmer'
  | 'hiddenPhone'
  | 'privateProxy'

export interface DialogueChoice {
  text: string
  heat: number
  success: number
  next: number
  dirty: number
}

export interface DialogueNode {
  scammer: string
  victim: string
  choices: DialogueChoice[]
}

export interface ObservationChoice {
  text: string
  resultText: string
  heat: number
  suspicion: number
  stress: number
  evidence: number
  dirtyMoney: number
  cleanMoney: number
  note?: string
  unlockClue?: string
  toast?: ToastDescriptor
}

export interface VictimScenario {
  id: string
  name: string
  avatar: string
  type: string
  difficulty: string
  description: string
  script: DialogueNode[]
  redFlags: string[]
  clueId: string
  revealWeight: number
  observationPrompt: string
  observationVictimLine: string
  observationChoices: ObservationChoice[]
}

export interface ChatMessage {
  sender: ChatSender
  text: string
}

export interface LogDescriptor {
  text: string
  color: string
}

export interface ToastDescriptor {
  text: string
  type: ToastType
}

export interface LogEntry extends LogDescriptor {
  id: string
  time: string
}

export interface ToastItem extends ToastDescriptor {
  id: string
}

export interface UpgradeDefinition {
  name: string
  cost: number
  level: number
  description: string
  currency: Currency
  availablePhase: GamePhase
  maxLevel: number
  findSpeedBonus?: number
  heatModifier?: number
  evidenceBonus?: number
  suspicionModifier?: number
  stressModifier?: number
  unlocksEscape?: boolean
}

export type UpgradeState = Record<UpgradeKey, UpgradeDefinition>

export interface ActiveVictimSession {
  victimId: string
  stepIndex: number
}

export interface EventTriggerConditions {
  phases?: GamePhase[]
  minimumDirtyMoney?: number
  minimumCleanMoney?: number
  minimumHeat?: number
  maximumHeat?: number
  minimumSuspicion?: number
  minimumEvidence?: number
  revealTriggered?: boolean
}

export type EventOperation =
  | {
      type: 'adjustMoney'
      currency: Currency
      amount: number
    }
  | {
      type: 'adjustHeat'
      amount: number
    }
  | {
      type: 'adjustSuspicion'
      amount: number
    }
  | {
      type: 'adjustStress'
      amount: number
    }
  | {
      type: 'adjustEvidence'
      amount: number
    }
  | {
      type: 'addLog'
      entry: LogDescriptor
    }
  | {
      type: 'addToast'
      toast: ToastDescriptor
    }
  | {
      type: 'addNote'
      note: string
    }
  | {
      type: 'unlockClue'
      clue: string
    }

export interface RandomEventChoice {
  text: string
  requirements?: {
    currency?: Currency
    minimumAmount?: number
    requiredUpgrade?: UpgradeKey
  }
  onSuccess: EventOperation[]
  onFailure?: EventOperation[]
}

export interface RandomEventDefinition {
  id: string
  title: string
  description: string
  conditions?: EventTriggerConditions
  choices: RandomEventChoice[]
}

export interface GameState {
  dirtyMoney: number
  cleanMoney: number
  withdrawnMoney: number
  heat: number
  stress: number
  suspicion: number
  evidence: number
  phase: GamePhase
  revealTriggered: boolean
  showRevealModal: boolean
  hasStarted: boolean
  showDisclaimer: boolean
  isMuted: boolean
  playerTitle: string
  logs: LogEntry[]
  toasts: ToastItem[]
  isFinding: boolean
  findProgress: number
  activeVictimSession: ActiveVictimSession | null
  activeObservationTargetId: string | null
  isVictimTyping: boolean
  chatMessages: ChatMessage[]
  activeEventId: string | null
  gameOverType: GameOverType
  upgrades: UpgradeState
  notes: string[]
  unlockedClues: string[]
  completedCaseCount: number
}

export interface GameTransition {
  changes?: Partial<GameState>
  appendLogs?: LogDescriptor[]
  appendToasts?: ToastDescriptor[]
  appendChatMessages?: ChatMessage[]
  replaceLogs?: LogDescriptor[]
  replaceChatMessages?: ChatMessage[]
  sound?: SoundEffect
}

export interface SimulatorDerivedState {
  activeClues: string[]
  activeEvent: RandomEventDefinition | null
  canEscape: boolean
  currentDialogue: DialogueNode | null
  currentVictim: VictimScenario | null
  riskLevel: RiskLevel
}

export interface SimulatorActions {
  acceptDisclaimer: () => void
  acceptReveal: () => void
  buyUpgrade: (key: UpgradeKey) => void
  escapeBorder: () => void
  launderDirtyMoney: () => void
  resolveActiveEventChoice: (choiceIndex: number) => void
  restartGame: () => void
  selectDialogueOption: (choiceIndex: number) => void
  selectObservationChoice: (choiceIndex: number) => void
  startFindingVictim: () => void
  toggleMuted: () => void
}

export interface UseSimulatorGameResult {
  actions: SimulatorActions
  chatEndRef: RefObject<HTMLDivElement | null>
  derived: SimulatorDerivedState
  state: GameState
}
