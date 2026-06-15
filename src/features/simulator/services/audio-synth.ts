import type { SoundEffect } from '@/features/simulator/types'

type AudioContextClass = typeof AudioContext

declare global {
  interface Window {
    webkitAudioContext?: AudioContextClass
  }
}

export class AudioSynth {
  private context: AudioContext | null = null

  private muted = false

  setMuted(isMuted: boolean) {
    this.muted = isMuted
  }

  init() {
    const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext

    if (!AudioContextConstructor) {
      return
    }

    if (!this.context) {
      this.context = new AudioContextConstructor()
    }

    if (this.context.state === 'suspended') {
      void this.context.resume()
    }
  }

  play(sound: SoundEffect) {
    if (this.muted) {
      return
    }

    this.init()

    if (!this.context) {
      return
    }

    try {
      const now = this.context.currentTime
      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.context.destination)

      if (sound === 'click') {
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(600, now)
        oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.08)
        gainNode.gain.setValueAtTime(0.1, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
        oscillator.start(now)
        oscillator.stop(now + 0.08)
      }

      if (sound === 'cash') {
        oscillator.type = 'triangle'
        oscillator.frequency.setValueAtTime(523.25, now)
        oscillator.frequency.setValueAtTime(659.25, now + 0.06)
        oscillator.frequency.setValueAtTime(783.99, now + 0.12)
        gainNode.gain.setValueAtTime(0.15, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
        oscillator.start(now)
        oscillator.stop(now + 0.25)
      }

      if (sound === 'alarm') {
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(150, now)
        oscillator.frequency.linearRampToValueAtTime(400, now + 0.2)
        oscillator.frequency.linearRampToValueAtTime(150, now + 0.4)
        gainNode.gain.setValueAtTime(0.15, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
        oscillator.start(now)
        oscillator.stop(now + 0.4)
      }

      if (sound === 'upgrade') {
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(261.63, now)
        oscillator.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3)
        gainNode.gain.setValueAtTime(0.12, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        oscillator.start(now)
        oscillator.stop(now + 0.3)
      }

      if (sound === 'fail') {
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(220, now)
        oscillator.frequency.setValueAtTime(110, now + 0.1)
        gainNode.gain.setValueAtTime(0.15, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
        oscillator.start(now)
        oscillator.stop(now + 0.25)
      }
    } catch {
      return
    }
  }
}
