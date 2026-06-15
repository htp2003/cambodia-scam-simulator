import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SimulatorPage from '@/pages/simulator/SimulatorPage'

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
    vi.spyOn(Math, 'random').mockReturnValue(0)
    vi.stubGlobal('AudioContext', MockAudioContext)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps gameplay locked behind the disclaimer until confirmed', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    const view = render(<SimulatorPage />)

    expect(view.getByText('Cảnh báo giáo dục')).toBeInTheDocument()

    await user.click(view.getByRole('button', { name: 'Tôi đã hiểu, bắt đầu ca trực' }))

    expect(view.queryByText('Cảnh báo giáo dục')).not.toBeInTheDocument()
  })

  it('can start a scam line and render the first dialogue flow', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    const view = render(<SimulatorPage />)

    await user.click(view.getByRole('button', { name: 'Tôi đã hiểu, bắt đầu ca trực' }))
    await user.click(view.getByRole('button', { name: 'MỞ LINE MỤC TIÊU MỚI' }))

    vi.advanceTimersByTime(2500)

    expect(view.getByText(/Line mới đã mở: Anh Tuấn/)).toBeInTheDocument()
    expect(view.getByText(/Chào anh Tuấn/)).toBeInTheDocument()

    vi.advanceTimersByTime(1500)

    expect(view.getByText(/Nghe cũng ham đó em/)).toBeInTheDocument()
  })

  it('does not crash when audio is unavailable and mute toggle is used', async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    vi.stubGlobal('AudioContext', undefined)

    const view = render(<SimulatorPage />)

    await user.click(view.getByRole('button', { name: 'Tôi đã hiểu, bắt đầu ca trực' }))
    await user.click(view.getByRole('button', { name: 'Toggle audio' }))

    expect(view.getByText('CAMBODIA SCAM SIMULATOR')).toBeInTheDocument()
  })
})
