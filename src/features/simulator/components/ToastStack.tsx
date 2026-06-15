import { AlertTriangle } from 'lucide-react'
import type { ToastItem } from '@/features/simulator/types'

interface ToastStackProps {
  toasts: ToastItem[]
}

export default function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in pointer-events-auto flex items-center gap-3 rounded-xl border bg-slate-900 p-4 text-xs font-semibold shadow-xl ${
            toast.type === 'success'
              ? 'border-emerald-500/30 text-emerald-400'
              : toast.type === 'warning'
                ? 'border-rose-500/30 text-rose-400'
                : 'border-blue-500/30 text-blue-400'
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  )
}
