import type { GameState } from '@/features/simulator/types'

export type SimulatorAction =
  | {
      type: 'replace'
      state: GameState
    }
  | {
      type: 'update'
      updater: (state: GameState) => GameState
    }

export const simulatorReducer = (state: GameState, action: SimulatorAction): GameState => {
  if (action.type === 'replace') {
    return action.state
  }

  return action.updater(state)
}
