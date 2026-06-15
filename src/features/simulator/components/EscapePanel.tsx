import { CheckCircle2, Circle, LogOut } from 'lucide-react'
import { ESCAPE_COST } from '@/features/simulator/data/constants'
import type { GamePhase } from '@/features/simulator/types'

interface EscapePanelProps {
  canEscape: boolean
  cleanMoney: number
  clueCount: number
  evidence: number
  hasHiddenPhone: boolean
  hasPrivateProxy: boolean
  phase: GamePhase
  onEscape: () => void
}

export default function EscapePanel({
  canEscape,
  cleanMoney,
  clueCount,
  evidence,
  hasHiddenPhone,
  hasPrivateProxy,
  phase,
  onEscape,
}: EscapePanelProps) {
  const checklist = [
    {
      label: 'Đủ 3 evidence',
      done: evidence >= 3,
    },
    {
      label: 'Đủ 3 clue khóa',
      done: clueCount >= 3,
    },
    {
      label: 'Có hidden phone',
      done: hasHiddenPhone,
    },
    {
      label: 'Có private proxy',
      done: hasPrivateProxy,
    },
    {
      label: `Có $${ESCAPE_COST.toLocaleString()} tiền sạch`,
      done: cleanMoney >= ESCAPE_COST,
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-900 bg-[#0b0c12]/80 p-5 shadow-2xl">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-500">
        <LogOut className="h-4 w-4 animate-pulse" />
        <span>Checklist thoát thân</span>
      </h3>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">
        {phase === 'scam'
          ? 'Bạn vẫn đang ở phần nổi của công việc. Chưa ai mở cho bạn cánh cửa đi ra.'
          : phase === 'surveillance'
            ? 'Giờ mục tiêu không còn là giàu lên, mà là gom đủ chứng cứ và chuẩn bị một đường rút không bị bóp nghẹt giữa chừng.'
            : 'Đường thoát đã hiện ra. Chỉ cần đủ sạch, đủ kín và đủ gan để bước tiếp.'}
      </p>

      <div className="mb-4 space-y-2 rounded-xl border border-slate-900 bg-slate-950/60 p-3">
        {checklist.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[11px] text-slate-300">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Circle className="h-4 w-4 text-slate-600" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold shadow-lg transition duration-150 ${
          canEscape
            ? 'bg-gradient-to-r from-rose-600 to-red-700 text-slate-100 hover:from-rose-500 hover:to-red-600'
            : 'cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500'
        }`}
        onClick={onEscape}
      >
        Kích hoạt đường thoát
      </button>
      <p className="mt-3 text-center text-[10px] text-slate-600">
        Tiền sạch hiện tại: ${cleanMoney.toLocaleString()}
      </p>
    </div>
  )
}
