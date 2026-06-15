import type { LogDescriptor } from '@/features/simulator/types'

export const MAX_HEAT = 100
export const MAX_SUSPICION = 100
export const MAX_STRESS = 100
export const ESCAPE_COST = 4_500
export const LAUNDER_RATE = 0.72
export const FIND_PROGRESS_INTERVAL_MS = 80
export const VICTIM_TYPING_DELAY_MS = 1400
export const TOAST_DURATION_MS = 4000
export const PASSIVE_TICK_MS = 1000
export const RANDOM_EVENT_CHANCE = 0.045
export const REVEAL_CASE_THRESHOLD = 2
export const REVEAL_CLEAN_MONEY_THRESHOLD = 450
export const EVIDENCE_REQUIRED = 3
export const CLUE_REQUIRED = 3

export const INITIAL_PLAYER_TITLE = 'Nhân viên chat line'

export const PLAYER_TITLE_THRESHOLDS = [
  { title: 'Kẻ đào thoát có hồ sơ', minimumScore: 12_000 },
  { title: 'Người giữ bằng chứng', minimumScore: 8_500 },
  { title: 'Mắt xích bắt đầu tỉnh', minimumScore: 4_500 },
  { title: 'Người ghi chép lặng im', minimumScore: 1_500 },
] as const

export const INITIAL_LOGS: LogDescriptor[] = [
  { text: 'Khởi động ca trực đêm tại khu nhà kín Bavet.', color: 'text-slate-500' },
  {
    text: 'Màn hình điều phối hội thoại đã đồng bộ. Mục tiêu ban đầu: đẩy doanh số bẩn.',
    color: 'text-emerald-500',
  },
  {
    text: 'Không khí trong phòng nặng như chì. Không ai nói chuyện ngoài tiếng rung của điện thoại.',
    color: 'text-amber-400',
  },
]

export const RESTART_LOGS: LogDescriptor[] = [
  {
    text: 'Ca trực được tua lại. Những gì bạn đã thấy vẫn còn ám trên màn hình.',
    color: 'text-emerald-500 font-bold',
  },
]
