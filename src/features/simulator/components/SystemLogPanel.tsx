import { FileStack, Terminal } from 'lucide-react'
import type { GamePhase, LogEntry } from '@/features/simulator/types'

interface SystemLogPanelProps {
  clues: string[]
  logs: LogEntry[]
  notes: string[]
  phase: GamePhase
}

export default function SystemLogPanel({ clues, logs, notes, phase }: SystemLogPanelProps) {
  return (
    <div className="relative flex flex-grow flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 p-4 shadow-xl">
      <div className="absolute top-0 right-0 left-0 h-0.5 bg-slate-900" />

      <div className="mb-3 flex items-center justify-between border-b border-slate-900 pb-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Terminal className="h-3.5 w-3.5 text-slate-500" />
          {phase === 'scam' ? 'Nhật ký line nội bộ' : 'Feed giám sát và ghi chú'}
        </span>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        </div>
      </div>

      {phase !== 'scam' && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-900 bg-[#0c0e14] p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <FileStack className="h-3.5 w-3.5 text-cyan-400" />
              Clues đã khóa
            </div>
            <div className="space-y-1.5">
              {clues.length === 0 ? (
                <p className="text-[10px] text-slate-600">Chưa lấy được đầu mối nào đủ cứng.</p>
              ) : (
                clues.map((clue) => (
                  <p key={clue} className="text-[10px] leading-relaxed text-cyan-300">
                    {clue}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-[#0c0e14] p-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Ghi chú tay
            </div>
            <div className="space-y-1.5">
              {notes.length === 0 ? (
                <p className="text-[10px] text-slate-600">Bạn vẫn chưa dám ghi gì ra.</p>
              ) : (
                notes.map((note) => (
                  <p key={note} className="text-[10px] leading-relaxed text-slate-300">
                    {note}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[260px] flex-grow overflow-y-auto pr-1 font-mono text-[11px] text-slate-400">
        {logs.map((log) => (
          <p key={log.id} className={`${log.color} border-b border-slate-950 py-1 leading-relaxed`}>
            <span className="text-slate-700">[{log.time}]</span> {log.text}
          </p>
        ))}
      </div>
    </div>
  )
}
