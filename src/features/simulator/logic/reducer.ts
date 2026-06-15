import { createInitialGameState } from '@/features/simulator/logic/game-rules'
import type {
  GameState,
  GameTransition,
  LogDescriptor,
  LogEntry,
  ToastDescriptor,
  ToastItem,
} from '@/features/simulator/types'

type SimulatorAction =
  | {
      type: 'applyTransition'
      transition: GameTransition
    }
  | {
      type: 'removeToast'
      id: string
    }
  | {
      type: 'replaceState'
      state: GameState
    }
  | {
      type: 'setActiveEvent'
      eventId: string | null
    }
  | {
      type: 'setFinding'
      findProgress: number
      isFinding: boolean
    }
  | {
      type: 'setMuted'
      isMuted: boolean
    }

const createId = (prefix: string) => {
  const randomSegment =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`

  return `${prefix}-${randomSegment}`
}

const createTimestamp = () => new Date().toTimeString().split(' ')[0]

const materializeLogs = (descriptors: LogDescriptor[]): LogEntry[] =>
  descriptors.map((entry) => ({
    ...entry,
    id: createId('log'),
    time: createTimestamp(),
  }))

const materializeToasts = (descriptors: ToastDescriptor[]): ToastItem[] =>
  descriptors.map((toast) => ({
    ...toast,
    id: createId('toast'),
  }))

const applyTransition = (state: GameState, transition: GameTransition): GameState => {
  if (
    !transition.changes &&
    !transition.appendLogs?.length &&
    !transition.appendToasts?.length &&
    !transition.appendChatMessages?.length &&
    !transition.replaceLogs &&
    !transition.replaceChatMessages
  ) {
    return state
  }

  const nextState = {
    ...state,
    ...transition.changes,
  }

  if (transition.replaceLogs) {
    nextState.logs = materializeLogs(transition.replaceLogs)
  } else if (transition.appendLogs?.length) {
    nextState.logs = [...state.logs.slice(-35), ...materializeLogs(transition.appendLogs)].slice(-36)
  }

  if (transition.replaceChatMessages) {
    nextState.chatMessages = transition.replaceChatMessages
  } else if (transition.appendChatMessages?.length) {
    nextState.chatMessages = [...state.chatMessages, ...transition.appendChatMessages]
  }

  if (transition.appendToasts?.length) {
    nextState.toasts = [...state.toasts, ...materializeToasts(transition.appendToasts)]
  }

  return nextState
}

export const simulatorInitialState = createInitialGameState()

export const simulatorReducer = (state: GameState, action: SimulatorAction): GameState => {
  if (action.type === 'applyTransition') {
    return applyTransition(state, action.transition)
  }

  if (action.type === 'removeToast') {
    return {
      ...state,
      toasts: state.toasts.filter((toast) => toast.id !== action.id),
    }
  }

  if (action.type === 'replaceState') {
    return action.state
  }

  if (action.type === 'setActiveEvent') {
    return {
      ...state,
      activeEventId: action.eventId,
    }
  }

  if (action.type === 'setFinding') {
    return {
      ...state,
      findProgress: action.findProgress,
      isFinding: action.isFinding,
    }
  }

  if (action.type === 'setMuted') {
    return {
      ...state,
      isMuted: action.isMuted,
    }
  }

  return state
}
