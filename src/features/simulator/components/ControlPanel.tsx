import { PLAYER_STAT_LABELS } from '@/features/simulator/data/constants'
import type { DailyKpi, DailyProgress, PlayerStats } from '@/features/simulator/types'
import { Meter, RetroWindow, SectionTitle } from './RetroPrimitives'

interface ControlPanelProps {
  day: number
  kpi: DailyKpi
  progress: DailyProgress
  stats: PlayerStats
}

const meterToneMap = {
  health: 'green',
  energy: 'green',
  mental: 'green',
  guilt: 'red',
  empathy: 'yellow',
  risk: 'red',
} as const

export default function ControlPanel({ day, kpi, progress, stats }: ControlPanelProps) {
  return (
    <RetroWindow className="control-panel" title="CONTROL PANEL">
      <div className="retro-content">
        <SectionTitle>DAILY TASKS / DAY {day}</SectionTitle>
        <div className="retro-list">
          <div className="retro-card retro-row">
            <span>Messages</span>
            <strong>
              {progress.messages}/{kpi.messages}
            </strong>
          </div>
          <div className="retro-card retro-row">
            <span>Money collected</span>
            <strong>
              ${progress.money.toLocaleString()}/${kpi.money.toLocaleString()}
            </strong>
          </div>
          <div className="retro-card retro-row">
            <span>Reports</span>
            <strong>
              {progress.reports}/{kpi.reportsMax}
            </strong>
          </div>
        </div>

        <SectionTitle>PLAYER STATUS</SectionTitle>
        {(Object.keys(PLAYER_STAT_LABELS) as Array<keyof typeof PLAYER_STAT_LABELS>).map(
          (key) => (
            <Meter
              key={key}
              label={PLAYER_STAT_LABELS[key]}
              tone={meterToneMap[key]}
              value={stats[key]}
            />
          ),
        )}
        <div className="retro-card retro-row retro-cash-row">
          <span>Personal cash</span>
          <strong>${stats.cash}</strong>
        </div>

        <SectionTitle>STICKY NOTES</SectionTitle>
        <div className="sticky-note">
          “Đừng tin lời quản lý. Camera hành lang tầng hai bị mù lúc đổi ca.”
          <span>— unknown</span>
        </div>
      </div>
    </RetroWindow>
  )
}
