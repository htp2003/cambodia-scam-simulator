import type { RefObject } from 'react'
import { ChevronRight, Eye, Terminal } from 'lucide-react'
import type {
  ChatMessage,
  DialogueNode,
  GamePhase,
  VictimScenario,
} from '@/features/simulator/types'

interface ChatPanelProps {
  chatEndRef: RefObject<HTMLDivElement | null>
  chatMessages: ChatMessage[]
  currentDialogue: DialogueNode | null
  currentVictim: VictimScenario | null
  findProgress: number
  isFinding: boolean
  isVictimTyping: boolean
  phase: GamePhase
  onSelectDialogueChoice: (choiceIndex: number) => void
  onSelectObservationChoice: (choiceIndex: number) => void
  onStartFindingVictim: () => void
}

export default function ChatPanel({
  chatEndRef,
  chatMessages,
  currentDialogue,
  currentVictim,
  findProgress,
  isFinding,
  isVictimTyping,
  phase,
  onSelectDialogueChoice,
  onSelectObservationChoice,
  onStartFindingVictim,
}: ChatPanelProps) {
  const isScamPhase = phase === 'scam'
  const actionLabel = isScamPhase ? 'MỞ LINE MỤC TIÊU MỚI' : 'MỞ MỘT CAGE GIÁM SÁT'
  const searchingLabel = isScamPhase ? 'Đang quét mục tiêu...' : 'Đang mở luồng camera...'
  const emptyTitle = isScamPhase ? 'Bảng chat line' : 'Bảng feed giám sát'
  const emptyDescription = isScamPhase
    ? 'Mở một line mới để vận hành kịch bản. Kiếm tiền bẩn đủ lâu trước khi mọi thứ lật sang mặt còn lại.'
    : 'Mở thêm một cage để đọc tình huống, ghi bằng chứng và quyết định bạn sẽ im lặng hay can thiệp.'

  return (
    <section className="relative flex h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-900 bg-[#0b0c12]/80 p-4 shadow-2xl lg:col-span-5">
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      <div className="mb-4 flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              currentVictim ? 'animate-ping bg-emerald-500' : 'bg-slate-600'
            }`}
          />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            {emptyTitle}
          </h3>
        </div>
        <span className="rounded border border-slate-800/60 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-500">
          {isScamPhase ? 'Phase 1: Scam' : phase === 'surveillance' ? 'Phase 2: Surveillance' : 'Escape Route'}
        </span>
      </div>

      <div className="mb-4 flex flex-grow flex-col gap-3 overflow-y-auto rounded-xl border border-slate-950 bg-[#06070a]/80 p-3">
        {chatMessages.length === 0 ? (
          <div className="my-auto space-y-3 text-center italic text-slate-600">
            {isScamPhase ? (
              <Terminal className="mx-auto h-10 w-10 animate-pulse text-slate-700" />
            ) : (
              <Eye className="mx-auto h-10 w-10 animate-pulse text-slate-700" />
            )}
            <p className="text-xs">{emptyDescription}</p>
          </div>
        ) : (
          chatMessages.map((message, index) => {
            if (message.sender === 'system') {
              return (
                <div
                  key={`${message.sender}-${index}`}
                  className="rounded-lg border border-slate-900 bg-slate-950 px-3 py-1.5 text-center font-mono text-[10px] text-slate-500"
                >
                  {message.text}
                </div>
              )
            }

            const isScammer = message.sender === 'scammer'

            return (
              <div
                key={`${message.sender}-${index}`}
                className={`flex max-w-[85%] flex-col ${
                  isScammer ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span
                  className={`mb-1 text-[9px] font-bold ${
                    isScammer ? 'text-emerald-400' : 'text-amber-500'
                  }`}
                >
                  {isScammer ? 'Bạn' : currentVictim?.name ?? 'Mục tiêu'}
                </span>
                <div
                  className={`rounded-xl p-3 text-xs leading-relaxed ${
                    isScammer
                      ? 'border border-emerald-500/20 bg-emerald-950/40 text-emerald-100'
                      : 'border border-slate-800 bg-slate-900 text-slate-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            )
          })
        )}

        {isVictimTyping && (
          <div className="mr-auto flex max-w-[85%] flex-col items-start">
            <span className="mb-1 text-[9px] font-bold text-amber-500">
              {currentVictim?.name} is typing...
            </span>
            <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-xs italic text-slate-400">
              Đang soạn tin nhắn...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="space-y-3">
        {currentVictim && !isScamPhase && (
          <div className="rounded-xl border border-slate-900 bg-slate-950/70 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Red Flags của case này
            </p>
            <div className="space-y-1.5">
              {currentVictim.redFlags.map((flag) => (
                <p key={flag} className="text-[11px] leading-relaxed text-slate-300">
                  {flag}
                </p>
              ))}
            </div>
          </div>
        )}

        {isFinding && (
          <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-900 bg-slate-950">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${findProgress}%` }}
            />
          </div>
        )}

        {!currentVictim ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-4 font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition duration-150 active:scale-95 disabled:opacity-50 hover:from-emerald-400 hover:to-cyan-400"
            disabled={isFinding}
            onClick={onStartFindingVictim}
          >
            {isFinding ? searchingLabel : actionLabel}
          </button>
        ) : isScamPhase ? (
          <div className="grid max-h-[160px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {currentDialogue?.choices.map((choice, index) => (
              <button
                key={choice.text}
                type="button"
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-[#0f1118] p-3 text-left text-xs font-medium text-slate-200 transition duration-150 hover:border-slate-700 hover:bg-[#151924] hover:text-white disabled:opacity-40"
                disabled={isVictimTyping}
                onClick={() => onSelectDialogueChoice(index)}
              >
                <span className="flex-grow pr-3">{choice.text}</span>
                <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid max-h-[200px] grid-cols-1 gap-2 overflow-y-auto pr-1">
            {currentVictim.observationChoices.map((choice, index) => (
              <button
                key={choice.text}
                type="button"
                className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-[#0f1118] p-3 text-left text-xs font-medium text-slate-200 transition duration-150 hover:border-slate-700 hover:bg-[#151924] hover:text-white"
                onClick={() => onSelectObservationChoice(index)}
              >
                <span className="flex-grow pr-3">{choice.text}</span>
                <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
