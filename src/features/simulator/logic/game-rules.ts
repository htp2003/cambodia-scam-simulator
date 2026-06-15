import {
  CLUE_REQUIRED,
  ESCAPE_COST,
  EVIDENCE_REQUIRED,
  INITIAL_LOGS,
  INITIAL_PLAYER_TITLE,
  LAUNDER_RATE,
  MAX_HEAT,
  MAX_STRESS,
  MAX_SUSPICION,
  PLAYER_TITLE_THRESHOLDS,
  RESTART_LOGS,
} from '@/features/simulator/data/constants'
import { createInitialUpgradeState } from '@/features/simulator/data/upgrades'
import type {
  GameOverType,
  GameState,
  GameTransition,
  ObservationChoice,
  RandomEventChoice,
  RiskLevel,
  SoundEffect,
  UpgradeDefinition,
  UpgradeKey,
  VictimScenario,
} from '@/features/simulator/types'

export interface DialogueResolutionInput {
  choiceIndex: number
  roll: number
  state: GameState
  victim: VictimScenario
}

const clampMeter = (value: number, max: number) => Math.round(Math.min(max, Math.max(0, value)))

const appendUnique = (items: string[], value?: string) => {
  if (!value || items.includes(value)) {
    return items
  }

  return [...items, value]
}

const getUpgradeSuspicionFactor = (state: GameState) => {
  const screenDimmerModifier =
    (state.upgrades.screenDimmer.suspicionModifier ?? 0) * state.upgrades.screenDimmer.level
  const privateProxyModifier =
    (state.upgrades.privateProxy.suspicionModifier ?? 0) * state.upgrades.privateProxy.level

  return Math.max(0.45, 1 + screenDimmerModifier + privateProxyModifier)
}

const getUpgradeStressFactor = (state: GameState) => {
  const hiddenPhoneModifier =
    (state.upgrades.hiddenPhone.stressModifier ?? 0) * state.upgrades.hiddenPhone.level

  return Math.max(0.65, 1 + hiddenPhoneModifier)
}

const resolveLossType = (heat: number, suspicion: number, stress: number): GameOverType => {
  if (heat >= MAX_HEAT) {
    return 'raid'
  }

  if (suspicion >= MAX_SUSPICION) {
    return 'exposed'
  }

  if (stress >= MAX_STRESS) {
    return 'burnout'
  }

  return null
}

const buildScore = (state: Pick<GameState, 'cleanMoney' | 'evidence' | 'unlockedClues'>) =>
  state.cleanMoney + state.evidence * 2_200 + state.unlockedClues.length * 900

const getUpgradeCostScale = (upgrade: UpgradeDefinition) => {
  if (upgrade.maxLevel === 1) {
    return 1
  }

  return 1.65
}

export const clampHeat = (value: number) => clampMeter(value, MAX_HEAT)

export const clampSuspicion = (value: number) => clampMeter(value, MAX_SUSPICION)

export const clampStress = (value: number) => clampMeter(value, MAX_STRESS)

export const getPlayerTitle = (score: number) => {
  const matchedThreshold = PLAYER_TITLE_THRESHOLDS.find(({ minimumScore }) => score >= minimumScore)

  return matchedThreshold?.title ?? INITIAL_PLAYER_TITLE
}

export const calculateRiskLevel = (
  state: Pick<GameState, 'heat' | 'stress' | 'suspicion'>,
): RiskLevel => {
  const maxRisk = Math.max(state.heat, state.stress, state.suspicion)

  if (maxRisk >= 80) {
    return 'critical'
  }

  if (maxRisk >= 55) {
    return 'high'
  }

  if (maxRisk >= 30) {
    return 'medium'
  }

  return 'low'
}

export const canUnlockEscapeRoute = (
  state: Pick<GameState, 'evidence' | 'unlockedClues' | 'upgrades' | 'revealTriggered'>,
) =>
  state.revealTriggered &&
  state.evidence >= EVIDENCE_REQUIRED &&
  state.unlockedClues.length >= CLUE_REQUIRED &&
  state.upgrades.hiddenPhone.level > 0 &&
  state.upgrades.privateProxy.level > 0

export const createInitialGameState = (): GameState => ({
  dirtyMoney: 0,
  cleanMoney: 0,
  withdrawnMoney: 0,
  heat: 0,
  stress: 0,
  suspicion: 0,
  evidence: 0,
  phase: 'scam',
  revealTriggered: false,
  showRevealModal: false,
  hasStarted: false,
  showDisclaimer: true,
  isMuted: false,
  playerTitle: INITIAL_PLAYER_TITLE,
  logs: INITIAL_LOGS.map((entry, index) => ({
    ...entry,
    id: `initial-log-${index + 1}`,
    time: `00:00:0${index + 1}`,
  })),
  toasts: [],
  isFinding: false,
  findProgress: 0,
  activeVictimSession: null,
  activeObservationTargetId: null,
  isVictimTyping: false,
  chatMessages: [],
  activeEventId: null,
  gameOverType: null,
  upgrades: createInitialUpgradeState(),
  notes: [],
  unlockedClues: [],
  completedCaseCount: 0,
})

export const createDisclaimerTransition = (): GameTransition => ({
  changes: {
    hasStarted: true,
    showDisclaimer: false,
  },
  sound: 'upgrade',
})

export const createTickTransition = (state: GameState): GameTransition => {
  const changes: Partial<GameState> = {}
  const appendLogs: NonNullable<GameTransition['appendLogs']> = []

  if (state.phase === 'scam') {
    if (!state.activeVictimSession && !state.isFinding && state.heat > 0) {
      changes.heat = clampHeat(state.heat - 1)
    }
  } else {
    const nextSuspicion = clampSuspicion(
      state.suspicion + (state.activeObservationTargetId ? 3 : 1) * getUpgradeSuspicionFactor(state),
    )
    const nextStress = clampStress(
      state.stress + (state.activeObservationTargetId ? 5 : 3) * getUpgradeStressFactor(state),
    )

    changes.suspicion = nextSuspicion
    changes.stress = nextStress

    if (!state.activeObservationTargetId && state.heat > 0) {
      changes.heat = clampHeat(state.heat - 1)
    }

    if (nextStress >= 70 && state.stress < 70) {
      appendLogs.push({
        text: 'Nhịp tim của bạn bắt đầu lạc điệu. Ở lại thêm trong căn phòng này đang bào mòn thần kinh.',
        color: 'text-amber-400',
      })
    }
  }

  const nextHeat = changes.heat ?? state.heat
  const nextSuspicion = changes.suspicion ?? state.suspicion
  const nextStress = changes.stress ?? state.stress
  const gameOverType = resolveLossType(nextHeat, nextSuspicion, nextStress)
  let sound: SoundEffect | undefined

  if (gameOverType) {
    changes.gameOverType = gameOverType
    sound = 'alarm'
  }

  return {
    changes,
    appendLogs,
    sound,
  }
}

export const createTitlePromotionTransition = (state: GameState): GameTransition | null => {
  const nextTitle = getPlayerTitle(buildScore(state))

  if (nextTitle === state.playerTitle) {
    return null
  }

  return {
    changes: {
      playerTitle: nextTitle,
    },
    appendLogs: [
      {
        text: `Bạn vừa tự nhìn mình bằng một cái tên khác: ${nextTitle}.`,
        color: 'text-amber-400 font-bold',
      },
    ],
    appendToasts: [
      {
        text: `Danh xưng mới: ${nextTitle}`,
        type: 'success',
      },
    ],
    sound: 'upgrade',
  }
}

export const createLaunderTransition = (state: GameState): GameTransition => {
  if (state.dirtyMoney <= 0) {
    return {
      appendToasts: [
        {
          text: 'Không còn khoản tiền bẩn nào để xoay vòng.',
          type: 'warning',
        },
      ],
    }
  }

  const processed = state.dirtyMoney
  const washed = Math.floor(processed * LAUNDER_RATE)

  return {
    changes: {
      dirtyMoney: 0,
      cleanMoney: state.cleanMoney + washed,
    },
    appendLogs: [
      {
        text: `Bạn vừa đẩy $${processed.toLocaleString()} qua lớp vỏ bọc và giữ lại $${washed.toLocaleString()} tiền sạch.`,
        color: 'text-cyan-400 font-bold',
      },
    ],
    appendToasts: [
      {
        text: `Tiền sạch cộng thêm $${washed.toLocaleString()}`,
        type: 'success',
      },
    ],
    sound: 'cash',
  }
}

const isUpgradeUnlockedInPhase = (phase: GameState['phase'], upgrade: UpgradeDefinition) =>
  upgrade.availablePhase === phase || (phase === 'escape' && upgrade.availablePhase === 'surveillance')

export const createBuyUpgradeTransition = (
  state: GameState,
  key: UpgradeKey,
): GameTransition => {
  const selectedUpgrade = state.upgrades[key]

  if (!isUpgradeUnlockedInPhase(state.phase, selectedUpgrade)) {
    return {
      appendToasts: [
        {
          text:
            selectedUpgrade.availablePhase === 'surveillance'
              ? 'Món này chỉ có ích sau khi bạn bắt đầu nhìn thấy mặt sau của hệ thống.'
              : 'Món này không còn phù hợp với giai đoạn hiện tại.',
          type: 'warning',
        },
      ],
    }
  }

  if (selectedUpgrade.level >= selectedUpgrade.maxLevel) {
    return {
      appendToasts: [
        {
          text: 'Bạn đã ép món này tới giới hạn của nó rồi.',
          type: 'warning',
        },
      ],
    }
  }

  const availableMoney =
    selectedUpgrade.currency === 'clean' ? state.cleanMoney : state.dirtyMoney

  if (availableMoney < selectedUpgrade.cost) {
    return {
      appendToasts: [
        {
          text:
            selectedUpgrade.currency === 'clean'
              ? 'Bạn chưa có đủ tiền sạch cho món này.'
              : 'Bạn chưa có đủ tiền bẩn cho món này.',
          type: 'warning',
        },
      ],
    }
  }

  const nextUpgradeLevel = selectedUpgrade.level + 1
  const nextCost =
    nextUpgradeLevel >= selectedUpgrade.maxLevel
      ? selectedUpgrade.cost
      : Math.round(selectedUpgrade.cost * getUpgradeCostScale(selectedUpgrade))

  const nextUpgrades = {
    ...state.upgrades,
    [key]: {
      ...selectedUpgrade,
      level: nextUpgradeLevel,
      cost: nextCost,
    },
  }

  const changes: Partial<GameState> = {
    upgrades: nextUpgrades,
  }

  if (selectedUpgrade.currency === 'clean') {
    changes.cleanMoney = state.cleanMoney - selectedUpgrade.cost
  } else {
    changes.dirtyMoney = state.dirtyMoney - selectedUpgrade.cost
  }

  const logTextMap: Record<UpgradeKey, string> = {
    keyboard: 'Nhịp quét mục tiêu nhanh lên. Mỗi lần vào line mới bớt đi vài giây chần chừ.',
    vpn: 'Một lớp định tuyến mới giúp heat tăng chậm hơn trong các cú ép nạp.',
    audioRecorder: 'Bạn có thêm một đường lưu âm thầm cho những gì căn phòng này muốn chôn kín.',
    screenDimmer: 'Màn hình tối đi vừa đủ để người đứng sau lưng khó đọc được bạn đang mở gì.',
    hiddenPhone: 'Một chiếc điện thoại phụ cuối cùng cũng nằm yên trong ngăn bàn, chờ đến lúc phải dùng.',
    privateProxy: 'Bạn có một tuyến chuyển dữ liệu ngoài sổ, đủ để ném bằng chứng đi trước khi bị khóa máy.',
  }

  return {
    changes,
    appendLogs: [
      {
        text: logTextMap[key],
        color: 'text-slate-300',
      },
    ],
    appendToasts: [
      {
        text: `Đã chuẩn bị: ${selectedUpgrade.name}`,
        type: 'success',
      },
    ],
    sound: 'upgrade',
  }
}

export const createDialogueChoiceTransition = ({
  choiceIndex,
  roll,
  state,
  victim,
}: DialogueResolutionInput): GameTransition => {
  const activeVictimSession = state.activeVictimSession

  if (!activeVictimSession) {
    return {}
  }

  const dialogueNode = victim.script[activeVictimSession.stepIndex]
  const selectedChoice = dialogueNode?.choices[choiceIndex]

  if (!dialogueNode || !selectedChoice) {
    return {}
  }

  const vpnFactor = Math.max(
    0.45,
    1 + (state.upgrades.vpn.heatModifier ?? 0) * state.upgrades.vpn.level,
  )
  const finalHeat = Math.round(selectedChoice.heat * vpnFactor)
  const nextHeat = clampHeat(state.heat + finalHeat)
  const isSuccessful = roll <= selectedChoice.success
  const changes: Partial<GameState> = {
    heat: nextHeat,
  }
  const appendLogs: NonNullable<GameTransition['appendLogs']> = []
  const appendToasts: NonNullable<GameTransition['appendToasts']> = []
  let sound: SoundEffect | undefined

  if (isSuccessful) {
    if (selectedChoice.dirty > 0) {
      changes.dirtyMoney = state.dirtyMoney + selectedChoice.dirty
      appendLogs.push({
        text: `Mục tiêu vừa nạp thêm $${selectedChoice.dirty.toLocaleString()} vào vòng xoáy.`,
        color: 'text-emerald-400 font-bold',
      })
      appendToasts.push({
        text: `Tiền bẩn +$${selectedChoice.dirty.toLocaleString()}`,
        type: 'success',
      })
      sound = 'cash'
    }

    if (selectedChoice.next === -1) {
      return {
        changes: {
          ...changes,
          activeVictimSession: null,
          isVictimTyping: false,
          completedCaseCount: state.completedCaseCount + 1,
        },
        appendChatMessages: [
          {
            sender: 'system',
            text: `Ca của ${victim.name} đã khép lại. Màn hình được dọn sạch nhanh hơn cả cảm giác tội lỗi.`,
          },
        ],
        appendLogs: [
          ...appendLogs,
          {
            text: `Bạn vừa khép lại một case của ${victim.name}. Căn phòng vẫn tiếp tục như chưa hề có ai khóc ở đầu dây bên kia.`,
            color: 'text-slate-500',
          },
        ],
        appendToasts,
        sound,
      }
    }

    return {
      changes: {
        ...changes,
        activeVictimSession: {
          victimId: victim.id,
          stepIndex: selectedChoice.next,
        },
      },
      appendLogs,
      appendToasts,
      sound,
    }
  }

  return {
    changes: {
      ...changes,
      activeVictimSession: null,
      isVictimTyping: false,
      completedCaseCount: state.completedCaseCount + 1,
    },
    appendLogs: [
      {
        text: `${victim.name} đã nghi ngờ và cắt line. Bạn nghe thấy supervisor chép miệng ở phía sau.`,
        color: 'text-rose-500 font-bold',
      },
    ],
    appendToasts: [
      {
        text: 'Mục tiêu đã tỉnh ra và rời cuộc trò chuyện.',
        type: 'warning',
      },
    ],
    appendChatMessages: [
      {
        sender: 'system',
        text: `${victim.name} đã thoát khỏi line này. Màn hình mới đang chờ bạn mở tiếp.`,
      },
    ],
    sound: sound ?? 'fail',
  }
}

export const createObservationChoiceTransition = (
  state: GameState,
  victim: VictimScenario,
  choice: ObservationChoice,
): GameTransition => {
  const suspicionFactor = getUpgradeSuspicionFactor(state)
  const stressFactor = getUpgradeStressFactor(state)
  const evidenceBonus =
    choice.evidence > 0
      ? state.upgrades.audioRecorder.level * (state.upgrades.audioRecorder.evidenceBonus ?? 0)
      : 0
  const nextHeat = clampHeat(state.heat + choice.heat)
  const nextSuspicion = clampSuspicion(state.suspicion + choice.suspicion * suspicionFactor)
  const nextStress = clampStress(state.stress + choice.stress * stressFactor)
  const nextEvidence = Math.max(0, state.evidence + choice.evidence + evidenceBonus)
  const nextDirtyMoney = Math.max(0, state.dirtyMoney + choice.dirtyMoney)
  const nextCleanMoney = Math.max(0, state.cleanMoney + choice.cleanMoney)
  const nextNotes = appendUnique(state.notes, choice.note)
  const nextClues = appendUnique(state.unlockedClues, choice.unlockClue)
  const lossType = resolveLossType(nextHeat, nextSuspicion, nextStress)

  return {
    changes: {
      activeObservationTargetId: null,
      cleanMoney: nextCleanMoney,
      completedCaseCount: state.completedCaseCount + 1,
      dirtyMoney: nextDirtyMoney,
      evidence: nextEvidence,
      gameOverType: lossType,
      heat: nextHeat,
      isVictimTyping: false,
      notes: nextNotes,
      suspicion: nextSuspicion,
      stress: nextStress,
      unlockedClues: nextClues,
    },
    appendChatMessages: [
      {
        sender: 'system',
        text: choice.resultText,
      },
      {
        sender: 'system',
        text: `Case giám sát của ${victim.name} đã đóng. Bạn phải tự quyết xem mình vừa sống sót hay vừa lún sâu hơn.`,
      },
    ],
    appendLogs: [
      {
        text: `${victim.name}: ${victim.redFlags.join(', ')}.`,
        color: 'text-amber-400',
      },
      {
        text: choice.resultText,
        color: lossType ? 'text-rose-500' : 'text-slate-300',
      },
    ],
    appendToasts: choice.toast ? [choice.toast] : undefined,
    sound: lossType ? 'alarm' : choice.evidence > 0 ? 'cash' : 'click',
  }
}

export const createRevealTransition = (): GameTransition => ({
  changes: {
    phase: 'surveillance',
    revealTriggered: true,
    showRevealModal: true,
    activeVictimSession: null,
    activeObservationTargetId: null,
    findProgress: 0,
    isFinding: false,
    isVictimTyping: false,
  },
  appendLogs: [
    {
      text: 'Một cửa sổ quản trị ẩn vừa bật lên. Danh sách camera nội bộ và bảng KPI thật của khu nhà xuất hiện ngay trước mặt bạn.',
      color: 'text-rose-500 font-bold',
    },
  ],
  appendToasts: [
    {
      text: 'Cú reveal đã tới. Bạn không còn chỉ là người vận hành line nữa.',
      type: 'warning',
    },
  ],
  sound: 'alarm',
})

export const createRevealAcceptanceTransition = (): GameTransition => ({
  changes: {
    showRevealModal: false,
  },
  replaceChatMessages: [
    {
      sender: 'system',
      text: 'Màn hình mới mở ra: camera trần, lịch đổi ca, ví lạnh, bảng KPI và danh sách người biến mất.',
    },
    {
      sender: 'system',
      text: 'Mục tiêu mới: sống sót đủ lâu để gom bằng chứng và rời khỏi nơi này trước khi bị gọi tên.',
    },
  ],
  appendLogs: [
    {
      text: 'Bạn đã nhìn thấy mặt sau của công việc. Từ đây trở đi, mỗi thao tác đều có thể là vé ra ngoài hoặc vé biến mất.',
      color: 'text-cyan-400',
    },
  ],
})

export const createEscapePhaseTransition = (): GameTransition => ({
  changes: {
    phase: 'escape',
  },
  appendLogs: [
    {
      text: 'Các mảnh bằng chứng đã đủ để ghép thành một đường thoát. Chỉ còn thiếu tiền sạch và một nhịp rút chân đúng lúc.',
      color: 'text-emerald-400 font-bold',
    },
  ],
  appendToasts: [
    {
      text: 'Đường thoát thân đã mở.',
      type: 'success',
    },
  ],
  sound: 'upgrade',
})

export const createEscapeTransition = (state: GameState): GameTransition => {
  if (!canUnlockEscapeRoute(state) || state.phase !== 'escape') {
    return {
      appendToasts: [
        {
          text: 'Bạn chưa ghép đủ bằng chứng và công cụ để rời khỏi khu nhà này.',
          type: 'warning',
        },
      ],
    }
  }

  if (state.cleanMoney < ESCAPE_COST) {
    return {
      appendToasts: [
        {
          text: `Bạn cần tối thiểu $${ESCAPE_COST.toLocaleString()} tiền sạch để mua đường ra ngoài.`,
          type: 'warning',
        },
      ],
    }
  }

  return {
    changes: {
      cleanMoney: state.cleanMoney - ESCAPE_COST,
      withdrawnMoney: state.withdrawnMoney + ESCAPE_COST,
      gameOverType: 'win',
    },
  }
}

const meetsChoiceRequirements = (state: GameState, choice: RandomEventChoice) => {
  const { requirements } = choice

  if (!requirements) {
    return true
  }

  if (requirements.requiredUpgrade && state.upgrades[requirements.requiredUpgrade].level <= 0) {
    return false
  }

  if (
    requirements.currency &&
    requirements.minimumAmount !== undefined &&
    ((requirements.currency === 'dirty' && state.dirtyMoney < requirements.minimumAmount) ||
      (requirements.currency === 'clean' && state.cleanMoney < requirements.minimumAmount))
  ) {
    return false
  }

  return true
}

export const createEventChoiceTransition = (
  state: GameState,
  choice: RandomEventChoice,
  _now?: number,
): GameTransition => {
  const operations = meetsChoiceRequirements(state, choice) ? choice.onSuccess : choice.onFailure ?? []
  const changes: Partial<GameState> = {
    activeEventId: null,
  }
  const appendLogs: NonNullable<GameTransition['appendLogs']> = []
  const appendToasts: NonNullable<GameTransition['appendToasts']> = []
  let nextNotes = state.notes
  let nextClues = state.unlockedClues

  for (const operation of operations) {
    if (operation.type === 'adjustMoney') {
      if (operation.currency === 'dirty') {
        changes.dirtyMoney = Math.max(0, (changes.dirtyMoney ?? state.dirtyMoney) + operation.amount)
      }

      if (operation.currency === 'clean') {
        changes.cleanMoney = Math.max(0, (changes.cleanMoney ?? state.cleanMoney) + operation.amount)
      }
    }

    if (operation.type === 'adjustHeat') {
      changes.heat = clampHeat((changes.heat ?? state.heat) + operation.amount)
    }

    if (operation.type === 'adjustSuspicion') {
      changes.suspicion = clampSuspicion((changes.suspicion ?? state.suspicion) + operation.amount)
    }

    if (operation.type === 'adjustStress') {
      changes.stress = clampStress((changes.stress ?? state.stress) + operation.amount)
    }

    if (operation.type === 'adjustEvidence') {
      changes.evidence = Math.max(0, (changes.evidence ?? state.evidence) + operation.amount)
    }

    if (operation.type === 'addLog') {
      appendLogs.push(operation.entry)
    }

    if (operation.type === 'addToast') {
      appendToasts.push(operation.toast)
    }

    if (operation.type === 'addNote') {
      nextNotes = appendUnique(nextNotes, operation.note)
    }

    if (operation.type === 'unlockClue') {
      nextClues = appendUnique(nextClues, operation.clue)
    }
  }

  changes.notes = nextNotes
  changes.unlockedClues = nextClues

  const lossType = resolveLossType(
    changes.heat ?? state.heat,
    changes.suspicion ?? state.suspicion,
    changes.stress ?? state.stress,
  )

  if (lossType) {
    changes.gameOverType = lossType
  }

  return {
    changes,
    appendLogs,
    appendToasts,
    sound: lossType ? 'alarm' : undefined,
  }
}

export const createRestartState = (state: GameState): GameState => ({
  ...createInitialGameState(),
  isMuted: state.isMuted,
  hasStarted: true,
  showDisclaimer: false,
  logs: RESTART_LOGS.map((entry, index) => ({
    ...entry,
    id: `restart-log-${index + 1}`,
    time: '00:00:01',
  })),
  toasts: [
    {
      id: 'restart-toast',
      text: 'Ca trực đã được khởi động lại.',
      type: 'success',
    },
  ],
})
