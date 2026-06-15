import type { ReactNode } from 'react'
import {
  FileAudio2,
  FileSearch,
  Keyboard,
  MonitorSmartphone,
  Shield,
  Waypoints,
} from 'lucide-react'
import type { GamePhase, UpgradeKey, UpgradeState } from '@/features/simulator/types'

interface UpgradesPanelProps {
  cleanMoney: number
  dirtyMoney: number
  phase: GamePhase
  upgrades: UpgradeState
  onBuyUpgrade: (key: UpgradeKey) => void
}

const iconMap: Record<UpgradeKey, ReactNode> = {
  keyboard: <Keyboard className="h-4 w-4" />,
  vpn: <Shield className="h-4 w-4" />,
  audioRecorder: <FileAudio2 className="h-4 w-4" />,
  screenDimmer: <MonitorSmartphone className="h-4 w-4" />,
  hiddenPhone: <FileSearch className="h-4 w-4" />,
  privateProxy: <Waypoints className="h-4 w-4" />,
}

const colorMap: Record<UpgradeKey, string> = {
  keyboard: 'text-amber-500',
  vpn: 'text-cyan-400',
  audioRecorder: 'text-emerald-400',
  screenDimmer: 'text-violet-400',
  hiddenPhone: 'text-rose-400',
  privateProxy: 'text-sky-400',
}

const isUnlockedInPhase = (phase: GamePhase, upgradePhase: GamePhase) =>
  upgradePhase === phase || (phase === 'escape' && upgradePhase === 'surveillance')

export default function UpgradesPanel({
  cleanMoney,
  dirtyMoney,
  phase,
  upgrades,
  onBuyUpgrade,
}: UpgradesPanelProps) {
  return (
    <div className="flex flex-grow flex-col rounded-2xl border border-slate-900 bg-[#0b0c12]/80 p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between border-b border-slate-900 pb-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
          Dụng cụ sinh tồn
        </h3>
        <span className="font-mono text-[10px] text-slate-500">
          {phase === 'scam' ? 'Giai đoạn kiếm tiền bẩn' : 'Giai đoạn gom bằng chứng'}
        </span>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {Object.entries(upgrades).map(([key, upgrade]) => {
          const typedKey = key as UpgradeKey
          const canAfford =
            upgrade.currency === 'clean' ? cleanMoney >= upgrade.cost : dirtyMoney >= upgrade.cost
          const phaseUnlocked = isUnlockedInPhase(phase, upgrade.availablePhase)
          const reachedCap = upgrade.level >= upgrade.maxLevel

          return (
            <div
              key={typedKey}
              className="group rounded-xl border border-slate-900 bg-slate-950/80 p-3 transition duration-150 hover:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg border border-slate-800 bg-slate-900 p-2 text-sm ${colorMap[typedKey]}`}
                  >
                    {iconMap[typedKey]}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200">{upgrade.name}</h4>
                      <span className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400">
                        Lvl {upgrade.level}/{upgrade.maxLevel}
                      </span>
                      <span className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
                        {upgrade.currency === 'clean' ? 'Clean' : 'Dirty'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                      {upgrade.description}
                    </p>
                    {!phaseUnlocked && (
                      <p className="mt-1 text-[10px] text-amber-400">
                        Mở khóa sau cú reveal.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-black transition duration-150 ${
                    phaseUnlocked && canAfford && !reachedCap
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500'
                  }`}
                  onClick={() => onBuyUpgrade(typedKey)}
                >
                  {reachedCap ? 'MAX' : `$${upgrade.cost.toLocaleString()}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
