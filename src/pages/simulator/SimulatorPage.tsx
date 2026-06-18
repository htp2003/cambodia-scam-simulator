import { Volume2, VolumeX } from 'lucide-react'
import ControlPanel from '@/features/simulator/components/ControlPanel'
import {
  RetroButton,
  RetroModal,
} from '@/features/simulator/components/RetroPrimitives'
import SurveillancePanel from '@/features/simulator/components/SurveillancePanel'
import Workstation from '@/features/simulator/components/Workstation'
import { formatTime } from '@/features/simulator/logic/game-rules'
import { useSimulatorGame } from '@/features/simulator/hooks/useSimulatorGame'
import { APP_VERSION } from '@/shared/config/version'

export default function SimulatorPage() {
  const { state, derived, actions, chatEndRef } = useSimulatorGame()
  const time = formatTime(state.timeMinutes)

  return (
    <div className="simulator-shell">
      {state.showDisclaimer && (
        <RetroModal
          title="CẢNH BÁO GIÁO DỤC"
          actions={
            <RetroButton tone="good" onClick={actions.acceptDisclaimer}>
              Tôi đã hiểu, bắt đầu ca trực
            </RetroButton>
          }
        >
          <p>
            Trò chơi này là một mô phỏng phản tư về các compound lừa đảo và những
            con người bị nghiền giữa áp lực doanh số, bạo lực và sự tuyệt vọng của
            nạn nhân.
          </p>
          <div className="warning-box">
            Không bắt chước bất kỳ hành vi lừa đảo tài chính nào. Nếu gặp tình
            huống tương tự ngoài đời, hãy dừng giao dịch, xác minh và báo cho người
            thân hoặc cơ quan chức năng.
          </div>
        </RetroModal>
      )}

      {state.isBooting && (
        <div className="boot-screen">
          <div>
            <p>SCAM CENTER INTERNAL SYSTEM v2.14</p>
            <p>Build {APP_VERSION}</p>
            <p>Connecting to PNH-04...</p>
            <p>Employee A-102 authenticated.</p>
          </div>
        </div>
      )}

      {derived.activeEvent && (
        <RetroModal title={derived.activeEvent.title}>
          <p>{derived.activeEvent.description}</p>
          <div className="event-choices">
            {derived.activeEvent.choices.map((choice, index) => (
              <RetroButton
                key={choice.text}
                className="choice-button"
                onClick={() => actions.chooseEvent(index)}
              >
                {choice.text}
              </RetroButton>
            ))}
          </div>
        </RetroModal>
      )}

      {state.ending && (
        <RetroModal
          title={state.ending.title}
          actions={
            <RetroButton onClick={actions.restartGame}>Chơi lại từ đầu</RetroButton>
          }
        >
          <div className="ending-content">
            <h2>{state.ending.title}</h2>
            <p>{state.ending.description}</p>
            <p>
              Final stats: Guilt {state.stats.guilt} | Empathy {state.stats.empathy}{' '}
              | Risk {state.stats.risk}
            </p>
          </div>
        </RetroModal>
      )}

      <div className="toast-stack">
        {state.toasts.map((toast) => (
          <div key={toast.id} className={`retro-toast retro-toast-${toast.type}`}>
            {toast.text}
          </div>
        ))}
      </div>

      <header className="top-statusbar">
        <div className="brand-block">
          <span>Cambodia Scam Simulator</span>
          <span className="brand-version">{APP_VERSION}</span>
        </div>
        <div className="top-metric">
          <span className="status-lamp" /> SERVER ONLINE
        </div>
        <div className="top-metric">
          DAY: <strong>{state.day}</strong>
        </div>
        <div className="top-metric">
          TIME: <strong>{time}</strong>
        </div>
        <div className="top-metric">
          KPI:{' '}
          <strong>
            ${state.progress.money.toLocaleString()}/${state.kpi.money.toLocaleString()}
          </strong>
        </div>
        <div className="top-metric">
          WARNING:{' '}
          <strong className={`warning-${derived.warningLevel.toLowerCase()}`}>
            {derived.warningLevel}
          </strong>
        </div>
        <div className="employee-id">
          EMPLOYEE ID: <strong>A-102</strong>
        </div>
        <button
          type="button"
          aria-label="Toggle audio"
          className="audio-button"
          onClick={actions.toggleMuted}
        >
          {state.isMuted ? <VolumeX /> : <Volume2 />}
        </button>
      </header>

      <main className="desktop-grid">
        <ControlPanel
          day={state.day}
          kpi={state.kpi}
          progress={state.progress}
          stats={state.stats}
        />
        <Workstation
          activeTab={state.activeTab}
          activeTarget={derived.activeTarget}
          activeTargetProgress={derived.activeTargetProgress}
          chatEndRef={chatEndRef}
          chatMessages={state.chatMessages}
          clues={state.clues}
          currentScene={derived.currentScene}
          escapeChance={derived.escapeChance}
          isTargetTyping={state.isTargetTyping}
          kpiPassed={derived.kpiPassed}
          nightActionsUsed={state.nightActionsUsed}
          phase={state.phase}
          progress={state.progress}
          researchedToday={state.researchedToday}
          sentSignal={state.sentSignal}
          targets={state.targets}
          onChooseDialogue={actions.chooseDialogue}
          onEndWorkDay={actions.endWorkDay}
          onFinishNight={actions.finishNight}
          onNightAction={actions.performNightAction}
          onResearch={actions.researchTarget}
          onSelectTab={actions.selectTab}
          onSelectTarget={actions.selectTarget}
          onTryEscape={actions.tryEscape}
        />
        <SurveillancePanel
          incidents={state.incidents}
          logs={state.logs}
          time={time}
        />
      </main>

      <footer className="bottom-statusbar">
        <span>Connected: PNH-04 | User: A-102 | Mode: OBSERVE ONLY</span>
        <span>
          {state.lastSavedAt ? `Autosaved ${state.lastSavedAt}` : 'Autosave: localStorage'} |{' '}
          {APP_VERSION}
        </span>
      </footer>
    </div>
  )
}
