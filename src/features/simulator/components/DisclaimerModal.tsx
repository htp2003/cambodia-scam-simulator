import { Skull } from 'lucide-react'

interface DisclaimerModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export default function DisclaimerModal({ isOpen, onConfirm }: DisclaimerModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border border-amber-500/30 bg-[#0c0e14] p-6 shadow-2xl shadow-amber-500/10 sm:p-8">
        <div className="mb-4 flex items-center gap-3 text-amber-500">
          <Skull className="h-8 w-8 animate-pulse" />
          <h2 className="text-2xl font-black uppercase tracking-wide">
            Cảnh báo giáo dục
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          <p>
            Trò chơi này là một mô phỏng châm biếm mang mục tiêu giáo dục. Nó cố tình đặt bạn vào
            bên trong guồng máy lừa đảo để người chơi thấy cách các line chat, tài khoản mồi và áp
            lực doanh số nghiền nát nạn nhân lẫn chính người bị ép ngồi vận hành chúng.
          </p>
          <div className="rounded border-l-4 border-amber-500 bg-amber-950/20 p-3 text-xs italic text-amber-300">
            Tuyệt đối không bắt chước bất kỳ hành vi lừa đảo tài chính nào ngoài đời thực. Nếu thấy
            mô típ giống với tình huống thật, hãy dừng lại, xác minh thông tin và báo cho người thân.
          </div>
          <p className="text-xs text-slate-400">Phiên bản này đi theo hướng phản tư và quan sát, không cổ vũ hành vi phạm pháp.</p>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-200 hover:from-emerald-400 hover:to-teal-500"
          onClick={onConfirm}
        >
          Tôi đã hiểu, bắt đầu ca trực
        </button>
      </div>
    </div>
  )
}
