import {
  ChatPanel,
  DisclaimerModal,
  EscapePanel,
  EventModal,
  GameOverModal,
  RevealModal,
  SimulatorHeader,
  SystemLogPanel,
  ToastStack,
  UpgradesPanel,
  WalletPanel,
  useSimulatorGame,
} from '@/features/simulator'

export default function SimulatorPage() {
  const { state, derived, actions, chatEndRef } = useSimulatorGame()

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#07080b] text-slate-100 selection:bg-emerald-500 selection:text-slate-900">
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-10 h-[500px] w-[500px] rounded-full bg-rose-500/5 blur-3xl" />

      <ToastStack toasts={state.toasts} />

      <DisclaimerModal isOpen={state.showDisclaimer} onConfirm={actions.acceptDisclaimer} />

      <RevealModal isOpen={state.showRevealModal} onConfirm={actions.acceptReveal} />

      <EventModal activeEvent={derived.activeEvent} onSelectChoice={actions.resolveActiveEventChoice} />

      <GameOverModal
        gameOverType={state.gameOverType}
        playerTitle={state.playerTitle}
        withdrawnMoney={state.withdrawnMoney}
        onRestart={actions.restartGame}
      />

      <SimulatorHeader
        heat={state.heat}
        isMuted={state.isMuted}
        phase={state.phase}
        playerTitle={state.playerTitle}
        riskLevel={derived.riskLevel}
        stress={state.stress}
        suspicion={state.suspicion}
        onToggleMuted={actions.toggleMuted}
      />

      <main className="mx-auto grid max-w-7xl flex-grow grid-cols-1 items-start gap-6 p-4 lg:grid-cols-12">
        <ChatPanel
          chatEndRef={chatEndRef}
          chatMessages={state.chatMessages}
          currentDialogue={derived.currentDialogue}
          currentVictim={derived.currentVictim}
          findProgress={state.findProgress}
          isFinding={state.isFinding}
          isVictimTyping={state.isVictimTyping}
          phase={state.phase}
          onSelectDialogueChoice={actions.selectDialogueOption}
          onSelectObservationChoice={actions.selectObservationChoice}
          onStartFindingVictim={actions.startFindingVictim}
        />

        <section className="flex flex-col gap-6 lg:col-span-4">
          <WalletPanel
            cleanMoney={state.cleanMoney}
            dirtyMoney={state.dirtyMoney}
            evidence={state.evidence}
            phase={state.phase}
            withdrawnMoney={state.withdrawnMoney}
            onLaunder={actions.launderDirtyMoney}
          />
          <UpgradesPanel
            cleanMoney={state.cleanMoney}
            dirtyMoney={state.dirtyMoney}
            phase={state.phase}
            upgrades={state.upgrades}
            onBuyUpgrade={actions.buyUpgrade}
          />
        </section>

        <section className="flex h-[620px] flex-col gap-6 lg:col-span-3">
          <EscapePanel
            canEscape={derived.canEscape}
            cleanMoney={state.cleanMoney}
            clueCount={derived.activeClues.length}
            evidence={state.evidence}
            hasHiddenPhone={state.upgrades.hiddenPhone.level > 0}
            hasPrivateProxy={state.upgrades.privateProxy.level > 0}
            phase={state.phase}
            onEscape={actions.escapeBorder}
          />
          <SystemLogPanel
            clues={derived.activeClues}
            logs={state.logs}
            notes={state.notes}
            phase={state.phase}
          />
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-950 bg-slate-950/40 py-5 text-center text-[10px] text-slate-700">
        <p>
          Phiên bản hybrid pivot: bắt đầu như scam simulator, kết thúc như một bài thoát thân khỏi
          hệ thống đang nuốt chính người vận hành nó.
        </p>
        <p className="mt-1 font-medium italic text-slate-600">
          Cảnh giác với mọi lời hứa lợi nhuận nhanh, mọi line chat ép nạp và mọi cuộc gọi giả danh
          cơ quan chức năng.
        </p>
      </footer>
    </div>
  )
}
