import type { ReactElement } from 'react'
import { HeartCrack, ShieldAlert, Skull, Sparkles } from 'lucide-react'
import type { GameOverType } from '@/features/simulator/types'

interface GameOverModalProps {
  gameOverType: GameOverType
  playerTitle: string
  withdrawnMoney: number
  onRestart: () => void
}

const contentMap: Record<
  Exclude<GameOverType, null>,
  {
    icon: ReactElement
    title: string
    barClass: string
    borderClass: string
    textClass: string
    badgeClass: string
    body: string[]
  }
> = {
  raid: {
    icon: <Skull className="h-10 w-10 animate-wiggle" />,
    title: 'BỊ ĐỘT KÍCH',
    barClass: 'bg-rose-500',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-500',
    badgeClass: 'bg-rose-500/10',
    body: [
      'Heat chạm ngưỡng và lực lượng ập vào khu nhà trước khi bạn kịp xóa dấu vết.',
      'Toàn bộ tài khoản, thiết bị và line chat bị niêm phong. Bạn trở thành một hồ sơ nữa trong chính hệ thống từng nuốt người khác.',
    ],
  },
  exposed: {
    icon: <ShieldAlert className="h-10 w-10 animate-pulse" />,
    title: 'BỊ LỘ',
    barClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/10',
    body: [
      'Suspicion đã tăng quá mức. Có người phát hiện bạn lưu thứ không nên lưu và nhìn vào nơi không nên nhìn.',
      'Cánh cửa phòng giám sát mở ra. Tên bạn không còn ở danh sách nhân viên nữa.',
    ],
  },
  burnout: {
    icon: <HeartCrack className="h-10 w-10 animate-pulse" />,
    title: 'GỤC TRONG CA TRỰC',
    barClass: 'bg-fuchsia-500',
    borderClass: 'border-fuchsia-500',
    textClass: 'text-fuchsia-400',
    badgeClass: 'bg-fuchsia-500/10',
    body: [
      'Stress vượt ngưỡng. Bạn không còn đủ tỉnh táo để phân biệt giữa một line chat, một tiếng khóc và chính nhịp tim của mình.',
      'Bạn ngồi yên trước màn hình quá lâu. Cơ hội thoát đi cũng trôi luôn theo ca trực đó.',
    ],
  },
  win: {
    icon: <Sparkles className="h-10 w-10 animate-bounce" />,
    title: 'THOÁT RA NGOÀI',
    barClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/10',
    body: [
      'Bạn gom đủ bằng chứng, đủ tiền sạch và đủ công cụ để mở một đường rút không bị bóp nghẹt giữa chừng.',
    ],
  },
}

export default function GameOverModal({
  gameOverType,
  playerTitle,
  withdrawnMoney,
  onRestart,
}: GameOverModalProps) {
  if (!gameOverType) {
    return null
  }

  const content = {
    ...contentMap[gameOverType],
    body:
      gameOverType === 'win'
        ? [
            'Bạn gom đủ bằng chứng, đủ tiền sạch và đủ công cụ để mở một đường rút không bị bóp nghẹt giữa chừng.',
            `Số vốn mang ra được: $${withdrawnMoney.toLocaleString()}. Cái giá thật sự là những gì bạn đã phải nhìn thấy để đi tới đây.`,
          ]
        : contentMap[gameOverType].body,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-[#0e111a] p-8 text-center shadow-2xl">
        <div className={`absolute top-0 right-0 left-0 h-1.5 animate-pulse ${content.barClass}`} />
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border ${content.borderClass} ${content.badgeClass} ${content.textClass}`}
        >
          {content.icon}
        </div>
        <h2 className={`mb-4 text-3xl font-black uppercase tracking-wide ${content.textClass}`}>
          {content.title}
        </h2>
        <div className="mb-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left text-sm leading-relaxed text-slate-300">
          {content.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="font-semibold text-cyan-400">Danh xưng cuối cùng: {playerTitle}</p>
        </div>

        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-4 font-black text-slate-950 transition duration-200 hover:from-emerald-400 hover:to-cyan-400"
          onClick={onRestart}
        >
          Chơi lại từ đầu
        </button>
      </div>
    </div>
  )
}
