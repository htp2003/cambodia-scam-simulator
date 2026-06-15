import { EyeOff } from 'lucide-react'

interface RevealModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export default function RevealModal({ isOpen, onConfirm }: RevealModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-500/30 bg-[#0d1118] p-6 shadow-2xl shadow-rose-500/10 sm:p-8">
        <div className="mb-4 flex items-center gap-3 text-rose-400">
          <EyeOff className="h-8 w-8 animate-pulse" />
          <h2 className="text-2xl font-black uppercase tracking-wide">
            Bạn cũng đang bị nhìn lại
          </h2>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          <p>
            Một lớp giao diện ẩn vừa mở ra. Hóa ra mỗi camera trần, mỗi ví lạnh, mỗi bảng KPI giả
            danh công an trong khu nhà này đều được giám sát chéo. Bạn không chỉ đang xem nạn nhân.
            Có người cũng đang xem bạn.
          </p>
          <p>
            Từ đây, mục tiêu đổi hẳn: gom evidence, khóa clue, giữ suspicion và stress dưới ngưỡng,
            rồi mua cho mình một đường thoát trước khi tên bạn bị chuyển sang danh sách “làm việc
            riêng”.
          </p>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-4 font-black text-slate-950 shadow-lg shadow-rose-500/20 transition duration-200 hover:from-rose-400 hover:to-orange-400"
          onClick={onConfirm}
        >
          Nhìn tiếp
        </button>
      </div>
    </div>
  )
}
