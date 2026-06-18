import type { RefObject } from 'react'
import { MAX_NIGHT_ACTIONS } from '@/features/simulator/data/constants'
import { TARGETS } from '@/features/simulator/data/victims'
import type {
  ChatMessage,
  DayPhase,
  DialogueScene,
  EscapeClue,
  NightAction,
  TargetDefinition,
  TargetProgress,
  WorkstationTab,
} from '@/features/simulator/types'
import { Meter, RetroButton, RetroWindow, SectionTitle } from './RetroPrimitives'

interface WorkstationProps {
  activeTab: WorkstationTab
  activeTarget: TargetDefinition
  activeTargetProgress: TargetProgress
  chatEndRef: RefObject<HTMLDivElement | null>
  chatMessages: ChatMessage[]
  clues: EscapeClue[]
  currentScene: DialogueScene | null
  escapeChance: number
  isTargetTyping: boolean
  kpiPassed: boolean
  nightActionsUsed: number
  phase: DayPhase
  progress: {
    money: number
    messages: number
    reports: number
  }
  researchedToday: string[]
  sentSignal: boolean
  targets: TargetProgress[]
  onChooseDialogue: (choiceIndex: number) => void
  onEndWorkDay: () => void
  onFinishNight: () => void
  onNightAction: (action: NightAction) => void
  onResearch: () => void
  onSelectTab: (tab: WorkstationTab) => void
  onSelectTarget: (targetId: string) => void
  onTryEscape: () => void
}

const tabs: Array<{ id: WorkstationTab; label: string }> = [
  { id: 'chat', label: 'Chat' },
  { id: 'browser', label: 'Browser' },
  { id: 'dorm', label: 'Dorm' },
  { id: 'escape', label: 'Escape' },
  { id: 'report', label: 'Report' },
]

function TargetProfile({
  activeTarget,
  progress,
  targets,
  onSelectTarget,
}: {
  activeTarget: TargetDefinition
  progress: TargetProgress
  targets: TargetProgress[]
  onSelectTarget: (targetId: string) => void
}) {
  return (
    <aside className="target-profile">
      <SectionTitle>TARGET PROFILE</SectionTitle>
      <div className="target-avatar">
        <span>{activeTarget.avatar}</span>
        <small>PROFILE PHOTO</small>
      </div>
      <h3>
        {activeTarget.name}, {activeTarget.age}
      </h3>
      <p>
        <strong>Job:</strong> {activeTarget.job}
      </p>
      <p>
        <strong>Location:</strong> {activeTarget.location}
      </p>
      <p>
        <strong>Weakness:</strong> {activeTarget.weakness}
      </p>
      <Meter label="Trust" tone="green" value={progress.trust} />
      <Meter label="Suspicion" tone="red" value={progress.suspicion} />
      <p className="retro-small">Money Given: ${progress.moneyCollected.toLocaleString()}</p>
      <p className="retro-small">
        Status: <strong>{progress.status}</strong>
      </p>

      <SectionTitle>TARGET LIST</SectionTitle>
      <div className="retro-list">
        {TARGETS.map((target) => (
          <button
            key={target.id}
            type="button"
            className={`target-card ${target.id === activeTarget.id ? 'target-card-active' : ''}`}
            onClick={() => onSelectTarget(target.id)}
          >
            <strong>{target.name}</strong>
            <span>
              {target.job} |{' '}
              {targets.find((item) => item.id === target.id)?.status ?? 'active'}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}

function ChatScreen({
  activeTarget,
  activeTargetProgress,
  chatEndRef,
  chatMessages,
  currentScene,
  isTargetTyping,
  phase,
  targets,
  onChooseDialogue,
  onSelectTab,
  onSelectTarget,
}: WorkstationProps) {
  const visibleMessages = chatMessages.filter(
    (message) => message.targetId === activeTarget.id,
  )

  return (
    <div className="work-area">
      <TargetProfile
        activeTarget={activeTarget}
        progress={activeTargetProgress}
        targets={targets}
        onSelectTarget={onSelectTarget}
      />
      <div className="chat-box">
        <div className="chat-messages">
          <div className="chat-message chat-message-system">
            CONNECTED TO TARGET_{activeTarget.id.toUpperCase()} // LOGGING ENABLED
          </div>
          {visibleMessages.length === 0 && currentScene && (
            <>
              <div className="chat-message chat-message-player">
                {currentScene.playerLine}
              </div>
              <div className="chat-message chat-message-target">
                {currentScene.targetLine}
              </div>
            </>
          )}
          {visibleMessages.map((message) => (
            <div
              key={message.id}
              className={`chat-message chat-message-${message.sender}`}
            >
              {message.text}
            </div>
          ))}
          {isTargetTyping && (
            <div className="chat-message chat-message-target chat-typing">
              {activeTarget.name} đang soạn tin...
            </div>
          )}
          {!currentScene && (
            <div className="chat-message chat-message-system">
              Conversation closed. Chọn target khác hoặc mở Daily Report.
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-choices">
          {phase !== 'work' ? (
            <p>Ca làm việc đã kết thúc. Chuyển sang Dorm hoặc Report.</p>
          ) : currentScene ? (
            currentScene.choices.map((choice, index) => (
              <RetroButton
                key={choice.text}
                className="choice-button"
                disabled={isTargetTyping}
                onClick={() => onChooseDialogue(index)}
              >
                {choice.text}
              </RetroButton>
            ))
          ) : (
            <RetroButton onClick={() => onSelectTab('report')}>
              Open Daily Report
            </RetroButton>
          )}
        </div>
      </div>
    </div>
  )
}

function BrowserScreen(props: WorkstationProps) {
  const researched = props.researchedToday.includes(props.activeTarget.id)

  return (
    <div className="screen-content">
      <div className="browser-panel">
        <SectionTitle>OLD BROWSER - INTERNAL WEB ACCESS</SectionTitle>
        <div className="browser-search">
          <input
            aria-label="Search target"
            className="retro-input"
            readOnly
            value={`${props.activeTarget.name} ${props.activeTarget.job} ${props.activeTarget.location}`}
          />
          <RetroButton
            disabled={researched || props.phase !== 'work'}
            onClick={props.onResearch}
          >
            {researched ? 'Researched' : 'Search'}
          </RetroButton>
        </div>
        <div className="browser-result">
          <strong>Cached profile: {props.activeTarget.name}</strong>
          <p>{props.activeTarget.description}</p>
        </div>
        <div className="browser-result">
          <strong>Known red flags</strong>
          <ul>
            {props.activeTarget.redFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
        {researched && (
          <div className="browser-result browser-result-warning">
            <strong>Internal note recovered</strong>
            <p>{props.activeTarget.researchFinding}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DormScreen(props: WorkstationProps) {
  const disabled =
    props.phase !== 'night' || props.nightActionsUsed >= MAX_NIGHT_ACTIONS
  const actions: Array<{
    id: NightAction
    label: string
    description: string
  }> = [
    { id: 'sleep', label: '🛏 Sleep', description: '+Energy, +Mental' },
    { id: 'eat', label: '🍚 Eat', description: '+Health, -Cash' },
    { id: 'window', label: '🪟 Inspect Window', description: 'Tìm đường và điểm mù' },
    { id: 'coworker', label: '🤫 Talk to Coworker', description: 'Tìm lịch bảo vệ, tăng risk' },
  ]

  return (
    <div className="screen-content">
      <SectionTitle>DORM ROOM - NIGHT PHASE</SectionTitle>
      <p className="retro-small">
        Hành động ban đêm: {props.nightActionsUsed}/{MAX_NIGHT_ACTIONS}
      </p>
      <div className="night-grid">
        {actions.map((action) => (
          <RetroButton
            key={action.id}
            className="night-action"
            disabled={disabled}
            onClick={() => props.onNightAction(action.id)}
          >
            <strong>{action.label}</strong>
            <span>{action.description}</span>
          </RetroButton>
        ))}
      </div>
      {props.phase === 'night' && (
        <RetroButton
          className="finish-night-button"
          tone="good"
          onClick={props.onFinishNight}
        >
          {props.nightActionsUsed >= MAX_NIGHT_ACTIONS
            ? 'Bắt đầu ngày tiếp theo'
            : 'Bỏ qua thời gian còn lại'}
        </RetroButton>
      )}
    </div>
  )
}

function EscapeScreen(props: WorkstationProps) {
  return (
    <div className="screen-content">
      <SectionTitle>ESCAPE INVESTIGATION</SectionTitle>
      <div className="retro-card clue-list">
        <strong>Collected clues</strong>
        {props.clues.length === 0 ? (
          <p>✗ Chưa có manh mối nào</p>
        ) : (
          props.clues.map((clue) => <p key={clue.id}>✓ {clue.label}</p>)
        )}
        <p>{props.sentSignal ? '✓' : '✗'} Tín hiệu cầu cứu đã được gửi</p>
      </div>
      <div className="retro-card">
        Escape chance: <strong>{props.escapeChance}%</strong>
      </div>
      <Meter label="Escape chance" tone="green" value={props.escapeChance} />
      <p className="retro-small">
        Công thức: clue × 25 − risk ÷ 3 + 15 nếu đã gửi tín hiệu. Cần tối thiểu 2
        clue để thử.
      </p>
      <RetroButton
        tone="danger"
        disabled={props.clues.length < 2}
        onClick={props.onTryEscape}
      >
        Attempt Escape
      </RetroButton>
    </div>
  )
}

function ReportScreen(props: WorkstationProps) {
  return (
    <div className="screen-content">
      <SectionTitle>DAILY REPORT</SectionTitle>
      <div className="retro-list">
        <div className="retro-card">Messages: {props.progress.messages}</div>
        <div className="retro-card">
          Money: ${props.progress.money.toLocaleString()}
        </div>
        <div className="retro-card">Reports: {props.progress.reports}</div>
        <div className="retro-card">
          Result:{' '}
          <strong className={props.kpiPassed ? 'text-ok' : 'text-danger'}>
            {props.kpiPassed ? 'PASSED' : 'FAILED'}
          </strong>
        </div>
        <div className="retro-card">
          Manager comment: “
          {props.kpiPassed ? 'Useful. Continue.' : 'Do better tomorrow. Or else.'}”
        </div>
      </div>
      <RetroButton
        tone="good"
        disabled={props.phase !== 'work'}
        onClick={props.onEndWorkDay}
      >
        End Work Day
      </RetroButton>
    </div>
  )
}

export default function Workstation(props: WorkstationProps) {
  return (
    <RetroWindow
      className="workstation"
      controls="_ □ ×"
      title="WORKSTATION / EMPLOYEE A-102"
    >
      <div className="workstation-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`workstation-tab ${props.activeTab === tab.id ? 'workstation-tab-active' : ''}`}
            onClick={() => props.onSelectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="workstation-screen">
        {props.activeTab === 'chat' && <ChatScreen {...props} />}
        {props.activeTab === 'browser' && <BrowserScreen {...props} />}
        {props.activeTab === 'dorm' && <DormScreen {...props} />}
        {props.activeTab === 'escape' && <EscapeScreen {...props} />}
        {props.activeTab === 'report' && <ReportScreen {...props} />}
      </div>
    </RetroWindow>
  )
}
