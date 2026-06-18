import type { EscapeClue, PlayerStatKey } from '@/features/simulator/types'

export const SAVE_KEY = 'cambodia_scam_simulator_save_v2'
export const SAVE_VERSION = 2
export const WORK_START_MINUTES = 9 * 60
export const WORK_END_MINUTES = 18 * 60
export const MAX_DAY = 3
export const MAX_NIGHT_ACTIONS = 2
export const EVENT_CHANCE = 0.24
export const TYPING_DELAY_MS = 900
export const BOOT_DELAY_MS = 1200

export const PLAYER_STAT_LABELS: Record<PlayerStatKey, string> = {
  health: 'Health',
  energy: 'Energy',
  mental: 'Mental',
  guilt: 'Guilt',
  empathy: 'Empathy',
  risk: 'Risk',
}

export const NIGHT_CLUES: Record<'window' | 'coworker', EscapeClue> = {
  window: {
    id: 'camera-blind-spot',
    label: 'Điểm mù camera gần cầu thang tầng hai',
    source: 'night',
  },
  coworker: {
    id: 'guard-schedule',
    label: 'Lịch đổi ca của đội bảo vệ nội khu',
    source: 'night',
  },
}
