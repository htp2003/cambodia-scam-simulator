import { Eye, Flame, HeartPulse, Skull, Volume2, VolumeX } from 'lucide-react'
import type { GamePhase, RiskLevel } from '@/features/simulator/types'

interface SimulatorHeaderProps {
  heat: number
  isMuted: boolean
  phase: GamePhase
  playerTitle: string
  riskLevel: RiskLevel
  stress: number
  suspicion: number
  onToggleMuted: () => void
}

export default function SimulatorHeader({
  heat,
  isMuted,
  phase,
  playerTitle,
  riskLevel,
  stress,
  suspicion,
  onToggleMuted,
}: SimulatorHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 shadow-lg shadow-emerald-500/20">
            <Skull className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-xl font-black tracking-wider text-transparent">
              CAMBODIA SCAM SIMULATOR
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-slate-500">
              {phase === 'scam'
                ? 'PHASE 1: CHẠY LINE KIẾM TIỀN BẨN'
                : phase === 'surveillance'
                  ? 'PHASE 2: BỊ GIÁM SÁT VÀ GOM BẰNG CHỨNG'
                  : 'ENDGAME: GHÉP ĐƯỜNG THOÁT THÂN'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="min-w-[140px] rounded-xl border border-slate-800/80 bg-[#0c0e14] px-4 py-2 text-center">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Danh xưng
            </span>
            <span className="text-xs font-black text-amber-400">{playerTitle}</span>
          </div>

          <div className="min-w-[120px] rounded-xl border border-slate-800/80 bg-[#0c0e14] px-4 py-2 text-center">
            <span className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <Flame className="h-3 w-3 text-rose-500" /> Heat
            </span>
            <span
              className={`mt-0.5 block text-xs font-black ${
                heat >= 75 ? 'animate-pulse text-rose-500' : heat >= 40 ? 'text-amber-500' : 'text-emerald-400'
              }`}
            >
              {heat}%
            </span>
          </div>

          <div className="min-w-[120px] rounded-xl border border-slate-800/80 bg-[#0c0e14] px-4 py-2 text-center">
            <span className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <Eye className="h-3 w-3 text-cyan-400" /> Suspicion
            </span>
            <span
              className={`mt-0.5 block text-xs font-black ${
                suspicion >= 75
                  ? 'animate-pulse text-rose-500'
                  : suspicion >= 40
                    ? 'text-amber-500'
                    : 'text-cyan-300'
              }`}
            >
              {suspicion}%
            </span>
          </div>

          <div className="min-w-[120px] rounded-xl border border-slate-800/80 bg-[#0c0e14] px-4 py-2 text-center">
            <span className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <HeartPulse className="h-3 w-3 text-fuchsia-400" /> Stress
            </span>
            <span
              className={`mt-0.5 block text-xs font-black ${
                stress >= 75
                  ? 'animate-pulse text-rose-500'
                  : stress >= 40
                    ? 'text-amber-500'
                    : 'text-fuchsia-300'
              }`}
            >
              {stress}%
            </span>
          </div>

          <div className="min-w-[110px] rounded-xl border border-slate-800/80 bg-[#0c0e14] px-4 py-2 text-center">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Risk
            </span>
            <span
              className={`mt-0.5 block text-xs font-black uppercase ${
                riskLevel === 'critical'
                  ? 'text-rose-500'
                  : riskLevel === 'high'
                    ? 'text-amber-500'
                    : riskLevel === 'medium'
                      ? 'text-cyan-300'
                      : 'text-emerald-400'
              }`}
            >
              {riskLevel}
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle audio"
            className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition duration-150 hover:bg-slate-800 hover:text-slate-200"
            onClick={onToggleMuted}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
