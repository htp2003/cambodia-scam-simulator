import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BOOT_DELAY_MS, SAVE_KEY, TYPING_DELAY_MS } from '@/features/simulator/data/constants'
import { createInitialGameState } from '@/features/simulator/logic/game-rules'
import SimulatorPage from '@/pages/simulator/SimulatorPage'
import { APP_VERSION } from '@/shared/config/version'

class MockAudioContext {
  currentTime = 0

  state: AudioContextState = 'running'

  destination = {}

  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        exponentialRampToValueAtTime: vi.fn(),
        setValueAtTime: vi.fn(),
      },
    }
  }

  createOscillator() {
    return {
      connect: vi.fn(),
      frequency: {
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        setValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
    }
  }

  resume = vi.fn()
}

describe('SimulatorPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    vi.stubGlobal('AudioContext', MockAudioContext)
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const startGame = () => {
    const view = render(<SimulatorPage />)

    fireEvent.click(view.getByRole('button', { name: 'Tôi đã hiểu, bắt đầu ca trực' }))
    expect(view.getByText('SCAM CENTER INTERNAL SYSTEM v2.14')).toBeInTheDocument()
    expect(view.getByText(`Build ${APP_VERSION}`)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(BOOT_DELAY_MS)
    })

    return {
      view,
    }
  }

  it('locks gameplay behind disclaimer and completes the boot sequence', () => {
    const { view } = startGame()

    expect(view.queryByText('CẢNH BÁO GIÁO DỤC')).not.toBeInTheDocument()
    expect(view.queryByText('SCAM CENTER INTERNAL SYSTEM v2.14')).not.toBeInTheDocument()
    expect(view.getByText('WORKSTATION / EMPLOYEE A-102')).toBeInTheDocument()
  })

  it('runs a target dialogue and updates daily progress', () => {
    const { view } = startGame()

    fireEvent.click(
      view.getByRole('button', {
        name: 'Chuyển thử 50k để tạo niềm tin rồi mời anh làm đơn đầu.',
      }),
    )

    expect(view.getByText('Anh Tuấn đang soạn tin...')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(TYPING_DELAY_MS)
    })

    expect(view.getByText(/Anh vừa nhận 50k nên cũng đỡ nghi/)).toBeInTheDocument()
    expect(view.getAllByText('$250/$3,000')).toHaveLength(2)
    expect(view.getByText('5/24')).toBeInTheDocument()
  })

  it('researches a target and prevents repeated research in one day', () => {
    const { view } = startGame()

    fireEvent.click(view.getByRole('button', { name: 'Browser' }))
    fireEvent.click(view.getByRole('button', { name: 'Search' }))

    expect(view.getByText('Internal note recovered')).toBeInTheDocument()
    expect(view.getByRole('button', { name: 'Researched' })).toBeDisabled()
  })

  it('moves from report to night and starts the next day', () => {
    const { view } = startGame()

    fireEvent.click(view.getByRole('button', { name: 'Report' }))
    fireEvent.click(view.getByRole('button', { name: 'End Work Day' }))

    expect(view.getByText('DORM ROOM - NIGHT PHASE')).toBeInTheDocument()

    fireEvent.click(view.getByRole('button', { name: /Sleep/ }))
    fireEvent.click(view.getByRole('button', { name: /Eat/ }))
    fireEvent.click(view.getByRole('button', { name: 'Bắt đầu ngày tiếp theo' }))

    expect(view.getByText('DAY:')).toBeInTheDocument()
    expect(view.getByText('2', { selector: '.top-metric strong' })).toBeInTheDocument()
    expect(view.getAllByText('$0/$3,900')).toHaveLength(2)
  })

  it('restores valid autosave and drops invalid saves', () => {
    const savedState = {
      ...createInitialGameState(),
      day: 2,
      showDisclaimer: false,
      lastSavedAt: '12:30:00',
    }
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(savedState))

    const restoredView = render(<SimulatorPage />)
    expect(restoredView.queryByText('CẢNH BÁO GIÁO DỤC')).not.toBeInTheDocument()
    expect(restoredView.getByText('2', { selector: '.top-metric strong' })).toBeInTheDocument()
    restoredView.unmount()

    window.localStorage.setItem(SAVE_KEY, '{"saveVersion":1}')
    const invalidView = render(<SimulatorPage />)
    expect(invalidView.getByText('CẢNH BÁO GIÁO DỤC')).toBeInTheDocument()
    expect(window.localStorage.getItem(SAVE_KEY)).toBeNull()
  })

  it('keeps audio controls safe when Web Audio is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined)
    const { view } = startGame()

    fireEvent.click(view.getByRole('button', { name: 'Toggle audio' }))

    expect(view.getByText('Cambodia Scam Simulator')).toBeInTheDocument()
    expect(view.getAllByText(APP_VERSION).length).toBeGreaterThan(0)
  })
})
