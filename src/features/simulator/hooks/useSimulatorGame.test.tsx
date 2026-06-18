import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SAVE_KEY } from '@/features/simulator/data/constants'
import { createInitialGameState } from '@/features/simulator/logic/game-rules'
import { useSimulatorGame } from '@/features/simulator/hooks/useSimulatorGame'

describe('useSimulatorGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
    vi.spyOn(Math, 'random').mockReturnValue(0.8)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('triggers eligible random events only after an action', () => {
    const { result } = renderHook(() =>
      useSimulatorGame({
        random: () => 0,
        storage: window.localStorage,
      }),
    )

    expect(result.current.state.activeEventId).toBeNull()

    act(() => {
      result.current.actions.researchTarget()
    })

    expect(result.current.state.activeEventId).toBe('generator-flicker')
  })

  it('uses the mocked roll to resolve a transparent escape attempt', () => {
    const savedState = {
      ...createInitialGameState(),
      showDisclaimer: false,
      clues: [
        { id: 'one', label: 'One', source: 'night' as const },
        { id: 'two', label: 'Two', source: 'event' as const },
      ],
    }
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(savedState))

    const { result } = renderHook(() =>
      useSimulatorGame({
        random: () => 0,
        storage: window.localStorage,
      }),
    )

    act(() => {
      result.current.actions.tryEscape()
    })

    expect(result.current.state.ending?.type).toBe('escaped')
  })

  it('autosaves state after meaningful actions', () => {
    const { result } = renderHook(() =>
      useSimulatorGame({
        random: () => 0.9,
        storage: window.localStorage,
      }),
    )

    act(() => {
      result.current.actions.acceptDisclaimer()
      vi.runAllTimers()
    })

    act(() => {
      result.current.actions.selectTab('browser')
    })

    const savedValue = window.localStorage.getItem(SAVE_KEY)
    expect(savedValue).not.toBeNull()
    expect(JSON.parse(savedValue ?? '{}').activeTab).toBe('browser')
  })
})
