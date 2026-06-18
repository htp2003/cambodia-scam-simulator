import type { LogEntry } from '@/features/simulator/types'
import { RetroWindow, SectionTitle } from './RetroPrimitives'

interface SurveillancePanelProps {
  incidents: LogEntry[]
  logs: LogEntry[]
  time: string
}

const LogList = ({ entries }: { entries: LogEntry[] }) => (
  <div className="retro-list">
    {entries.slice(-5).map((entry) => (
      <div key={entry.id} className={`retro-card retro-log retro-log-${entry.tone}`}>
        <span>[{entry.time}]</span> {entry.text}
      </div>
    ))}
  </div>
)

export default function SurveillancePanel({
  incidents,
  logs,
  time,
}: SurveillancePanelProps) {
  return (
    <RetroWindow className="surveillance-panel" title="SURVEILLANCE / ALERTS">
      <div className="retro-content">
        <SectionTitle>CCTV FEED</SectionTitle>
        <div className="cctv-feed">
          <div>
            <strong>● REC</strong> CAM-04 HALLWAY
          </div>
          <div>{time}:12</div>
          <div className="cctv-spacer" />
          <div>Signal: unstable</div>
          <div>Detected: guard patrol</div>
        </div>

        <SectionTitle>MANAGER MESSAGES</SectionTitle>
        <LogList entries={incidents} />

        <SectionTitle>INCIDENT LOG</SectionTitle>
        <LogList entries={logs} />
      </div>
    </RetroWindow>
  )
}
