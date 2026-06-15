import { ArrowRightLeft, Coins, FileBadge2 } from 'lucide-react'
import type { GamePhase } from '@/features/simulator/types'

interface WalletPanelProps {
  cleanMoney: number
  dirtyMoney: number
  evidence: number
  phase: GamePhase
  withdrawnMoney: number
  onLaunder: () => void
}

export default function WalletPanel({
  cleanMoney,
  dirtyMoney,
  evidence,
  phase,
  withdrawnMoney,
  onLaunder,
}: WalletPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-gradient-to-br from-[#0c0e14] to-[#06070a] p-5 shadow-2xl">
      <div className="pointer-events-none absolute -right-8 -bottom-8 -rotate-12 text-emerald-500/5">
        <Coins className="h-40 w-40" />
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Ví đen
          </p>
          <h2 className="mt-0.5 block text-3xl font-black tracking-tight text-emerald-400">
            ${dirtyMoney.toLocaleString()}
          </h2>
        </div>
        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
          {phase === 'scam' ? 'PHASE 1 CASHFLOW' : 'COVER FUNDS ONLY'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-slate-900 pt-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Ví sạch</p>
          <h3 className="text-lg font-bold tracking-tight text-slate-200">
            ${cleanMoney.toLocaleString()}
          </h3>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Evidence</p>
          <h3 className="flex items-center gap-1 text-lg font-bold tracking-tight text-cyan-300">
            <FileBadge2 className="h-4 w-4" />
            {evidence}
          </h3>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Đã rút</p>
          <h3 className="text-lg font-bold tracking-tight text-amber-500">
            ${withdrawnMoney.toLocaleString()}
          </h3>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-xs font-extrabold text-slate-300 transition duration-150 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        onClick={onLaunder}
      >
        <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
        Rửa tiền bẩn thành tiền sạch
      </button>

      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        {phase === 'scam'
          ? 'Tiền vẫn là động cơ chính trong giai đoạn đầu, nhưng nó cũng là thứ giữ bạn ở lại căn phòng này.'
          : 'Sau cú reveal, tiền chỉ còn là nhiên liệu để mua thời gian và chỗ đứng cho đường thoát.'}
      </p>
    </div>
  )
}
