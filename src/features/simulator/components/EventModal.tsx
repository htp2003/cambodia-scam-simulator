import { AlertTriangle } from 'lucide-react'
import type { RandomEventDefinition } from '@/features/simulator/types'

interface EventModalProps {
  activeEvent: RandomEventDefinition | null
  onSelectChoice: (choiceIndex: number) => void
}

export default function EventModal({ activeEvent, onSelectChoice }: EventModalProps) {
  if (!activeEvent) {
    return null
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-rose-500/40 bg-[#0e111a] p-6 shadow-2xl shadow-rose-500/10">
        <div className="mb-4 flex items-center gap-3 text-rose-500">
          <AlertTriangle className="h-8 w-8 animate-bounce" />
          <h2 className="text-xl font-extrabold uppercase tracking-wide">{activeEvent.title}</h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">{activeEvent.description}</p>
        <div className="flex flex-col gap-3">
          {activeEvent.choices.map((choice, index) => (
            <button
              key={choice.text}
              type="button"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-left text-xs font-semibold text-slate-200 transition duration-150 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              onClick={() => onSelectChoice(index)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
