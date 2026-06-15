import { describe, expect, it } from 'vitest'
import { RANDOM_EVENTS } from '@/features/simulator/data/events'
import { VICTIMS_DATABASE } from '@/features/simulator/data/victims'
import {
  canUnlockEscapeRoute,
  createBuyUpgradeTransition,
  createDialogueChoiceTransition,
  createEscapeTransition,
  createEventChoiceTransition,
  createInitialGameState,
  createLaunderTransition,
  createObservationChoiceTransition,
  createRestartState,
} from '@/features/simulator/logic/game-rules'

describe('game rules', () => {
  it('applies laundering with the configured fee', () => {
    const state = createInitialGameState()
    state.dirtyMoney = 1000

    const transition = createLaunderTransition(state)

    expect(transition.changes?.dirtyMoney).toBe(0)
    expect(transition.changes?.cleanMoney).toBe(720)
  })

  it('buys a surveillance upgrade using clean money after reveal', () => {
    const state = createInitialGameState()
    state.phase = 'surveillance'
    state.cleanMoney = 2_000

    const transition = createBuyUpgradeTransition(state, 'screenDimmer')

    expect(transition.changes?.cleanMoney).toBe(1_050)
    expect(transition.changes?.upgrades?.screenDimmer.level).toBe(1)
  })

  it('resolves successful dialogue with money gain and next step', () => {
    const state = createInitialGameState()
    state.activeVictimSession = {
      victimId: 'shipper_tuan',
      stepIndex: 0,
    }

    const transition = createDialogueChoiceTransition({
      choiceIndex: 0,
      roll: 1,
      state,
      victim: VICTIMS_DATABASE[0],
    })

    expect(transition.changes?.heat).toBe(2)
    expect(transition.changes?.dirtyMoney).toBe(50)
    expect(transition.changes?.activeVictimSession).toEqual({
      victimId: 'shipper_tuan',
      stepIndex: 1,
    })
  })

  it('turns an observation choice into evidence and notes', () => {
    const state = createInitialGameState()
    state.phase = 'surveillance'
    state.revealTriggered = true
    state.activeObservationTargetId = 'shipper_tuan'

    const transition = createObservationChoiceTransition(
      state,
      VICTIMS_DATABASE[0],
      VICTIMS_DATABASE[0].observationChoices[0],
    )

    expect(transition.changes?.evidence).toBe(1)
    expect(transition.changes?.notes).toContain('Anh Tuấn vay nóng chỉ để tiếp tục nạp đơn ảo.')
    expect(transition.changes?.unlockedClues).toContain(
      'File ghi âm: người quản lý ép tăng nạp đơn của anh Tuấn',
    )
  })

  it('only allows escape when the route is fully unlocked', () => {
    const blockedState = createInitialGameState()
    blockedState.phase = 'escape'
    blockedState.cleanMoney = 10_000

    const blockedTransition = createEscapeTransition(blockedState)

    expect(blockedTransition.changes).toBeUndefined()

    const readyState = createInitialGameState()
    readyState.phase = 'escape'
    readyState.revealTriggered = true
    readyState.cleanMoney = 10_000
    readyState.evidence = 3
    readyState.unlockedClues = ['a', 'b', 'c']
    readyState.upgrades.hiddenPhone.level = 1
    readyState.upgrades.privateProxy.level = 1

    expect(canUnlockEscapeRoute(readyState)).toBe(true)

    const successTransition = createEscapeTransition(readyState)

    expect(successTransition.changes?.cleanMoney).toBe(5_500)
    expect(successTransition.changes?.withdrawnMoney).toBe(4_500)
    expect(successTransition.changes?.gameOverType).toBe('win')
  })

  it('creates a clean restart baseline while keeping mute preference', () => {
    const state = createInitialGameState()
    state.isMuted = true
    state.cleanMoney = 1234
    state.dirtyMoney = 5678
    state.showDisclaimer = false
    state.hasStarted = true

    const restartedState = createRestartState(state)

    expect(restartedState.isMuted).toBe(true)
    expect(restartedState.cleanMoney).toBe(0)
    expect(restartedState.dirtyMoney).toBe(0)
    expect(restartedState.showDisclaimer).toBe(false)
    expect(restartedState.hasStarted).toBe(true)
  })

  it('applies random event outcomes and keeps suspicion within bounds', () => {
    const state = createInitialGameState()
    state.phase = 'surveillance'
    state.revealTriggered = true
    state.suspicion = 95

    const eventChoice = RANDOM_EVENTS[2].choices[0]
    const transition = createEventChoiceTransition(state, eventChoice, 1000)

    expect(transition.changes?.suspicion).toBe(100)
    expect(transition.changes?.activeEventId).toBeNull()
  })
})
