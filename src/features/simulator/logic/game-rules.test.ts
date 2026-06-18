import { describe, expect, it } from 'vitest'
import {
  addClue,
  applyChoiceEffects,
  calculateEscapeChance,
  createDayThreeEnding,
  createInitialGameState,
  createNextDayState,
  isKpiPassed,
  isValidSavedState,
  resolveCollapsedEnding,
} from '@/features/simulator/logic/game-rules'

describe('retro simulator game rules', () => {
  it('applies every declared dialogue effect', () => {
    const state = createInitialGameState()
    const nextState = applyChoiceEffects(state, {
      money: 500,
      messages: 4,
      trust: 5,
      suspicion: 3,
      risk: 8,
      guilt: 7,
      empathy: -4,
      energy: -6,
      health: -2,
      mental: -3,
      minutes: 45,
    })

    expect(nextState.progress.money).toBe(500)
    expect(nextState.progress.messages).toBe(4)
    expect(nextState.stats.risk).toBe(23)
    expect(nextState.stats.energy).toBe(69)
    expect(nextState.timeMinutes).toBe(585)
  })

  it('calculates a transparent bounded escape chance', () => {
    expect(calculateEscapeChance(2, 30, false)).toBe(40)
    expect(calculateEscapeChance(3, 30, true)).toBe(80)
    expect(calculateEscapeChance(8, 0, true)).toBe(95)
  })

  it('does not duplicate clues', () => {
    const clue = {
      id: 'guard',
      label: 'Guard schedule',
      source: 'night' as const,
    }

    expect(addClue(addClue([], clue), clue)).toEqual([clue])
  })

  it('evaluates KPI against money, messages and reports', () => {
    const state = createInitialGameState()
    expect(
      isKpiPassed({
        ...state,
        progress: {
          money: state.kpi.money,
          messages: state.kpi.messages,
          reports: state.kpi.reportsMax,
        },
      }),
    ).toBe(true)
  })

  it('creates the next day with increased KPI and reset daily progress', () => {
    const state = createInitialGameState()
    const nextState = createNextDayState(state)

    expect(nextState.day).toBe(2)
    expect(nextState.kpi.money).toBe(3900)
    expect(nextState.kpi.messages).toBe(31)
    expect(nextState.progress.money).toBe(0)
    expect(nextState.phase).toBe('work')
  })

  it('resolves collapse and day-three endings', () => {
    const state = createInitialGameState()
    expect(
      resolveCollapsedEnding({
        ...state,
        stats: {
          ...state.stats,
          mental: 0,
        },
      })?.type,
    ).toBe('collapsed')

    expect(
      createDayThreeEnding({
        ...state,
        day: 3,
        stats: {
          ...state.stats,
          empathy: 20,
        },
        progress: {
          ...state.progress,
          money: state.kpi.money,
        },
      }).type,
    ).toBe('manager')
  })

  it('validates save versions and minimum shape', () => {
    const state = createInitialGameState()
    expect(isValidSavedState(state)).toBe(true)
    expect(isValidSavedState({ ...state, saveVersion: 1 })).toBe(false)
    expect(isValidSavedState(null)).toBe(false)
  })
})
