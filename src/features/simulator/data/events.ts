import type { EventEffects, GameEvent } from '@/features/simulator/types'

const effects = (values: EventEffects): EventEffects => values

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'generator-flicker',
    title: 'MẤT NHỊP ĐIỆN HÀNH LANG',
    description:
      'Điện chập chờn vài giây. Camera tắt đúng một nhịp trong khi supervisor vẫn quát cả phòng giữ doanh số.',
    minimumDay: 1,
    phase: 'work',
    choices: [
      {
        text: 'Tranh thủ chép log chat sang thẻ nhớ riêng',
        result: 'Bạn lưu được một đoạn log trước khi điện ổn định trở lại.',
        effects: effects({ health: 0, energy: -4, mental: -3, guilt: -2, empathy: 3, risk: 10, cash: 0, money: 0, messages: 0, reports: 0, minutes: 15 }),
        clue: {
          id: 'power-gap',
          label: 'Camera ngừng ghi ba giây khi máy phát chuyển nhịp',
          source: 'event',
        },
      },
      {
        text: 'Ngồi im và tiếp tục chạy kịch bản',
        result: 'Bạn giữ vị trí an toàn nhưng cơ hội biến mất cùng ánh đèn.',
        effects: effects({ health: 0, energy: -2, mental: -4, guilt: 4, empathy: -2, risk: -4, cash: 0, money: 150, messages: 2, reports: 0, minutes: 15 }),
      },
    ],
  },
  {
    id: 'patrol-sweep',
    title: 'ĐỢT KIỂM TRA HÀNH CHÍNH',
    description:
      'Bảo vệ nội khu báo tối nay có đợt kiểm tra giấy tờ và phòng máy. Người bị ghim sẽ phải ngồi riêng với quản lý.',
    minimumDay: 1,
    phase: 'work',
    choices: [
      {
        text: 'Dùng tiền cá nhân để tên bạn biến khỏi danh sách',
        result: 'Một khoản bôi trơn giúp hồ sơ của bạn trượt khỏi chồng giấy.',
        effects: effects({ health: 0, energy: 0, mental: 2, guilt: 1, empathy: 0, risk: -12, cash: -10, money: 0, messages: 0, reports: 0, minutes: 10 }),
      },
      {
        text: 'Giấu ghi chép và chịu bị soi thêm',
        result: 'Đợt kiểm tra qua đi nhưng ánh mắt supervisor nán lại lâu hơn.',
        effects: effects({ health: 0, energy: -3, mental: -6, guilt: 0, empathy: 0, risk: 12, cash: 0, money: 0, messages: 0, reports: 0, minutes: 20 }),
      },
    ],
  },
  {
    id: 'camera-pivot',
    title: 'CAMERA ĐỔI GÓC QUAY',
    description:
      'Camera trần xoay thêm vài độ và dừng ngay phía trên bàn làm việc của bạn.',
    minimumDay: 2,
    phase: 'work',
    choices: [
      {
        text: 'Giả vờ xử lý KPI và giấu phần ghi chép',
        result: 'Bạn giữ được vẻ bình thản nhưng phải bỏ dở việc đang làm.',
        effects: effects({ health: 0, energy: -3, mental: -5, guilt: 2, empathy: 0, risk: -5, cash: 0, money: 100, messages: 2, reports: 0, minutes: 20 }),
      },
      {
        text: 'Cố chụp góc camera và lối hành lang',
        result: 'Bạn ghi lại được hướng quay, đổi lại camera giữ hình bàn bạn lâu hơn.',
        effects: effects({ health: 0, energy: -4, mental: -4, guilt: -2, empathy: 3, risk: 14, cash: 0, money: 0, messages: 0, reports: 0, minutes: 20 }),
        clue: {
          id: 'camera-rotation',
          label: 'Chu kỳ quay của camera trần khu workstation',
          source: 'event',
        },
      },
    ],
  },
  {
    id: 'coworker-missing',
    title: 'MỘT BÀN LÀM VIỆC BỖNG TRỐNG',
    description:
      'Bàn cạnh bạn bị dọn sạch. Không ai nhắc tên người vừa biến mất.',
    minimumDay: 2,
    phase: 'night',
    choices: [
      {
        text: 'Lén kiểm tra máy người đó trước khi ca trưởng quay lại',
        result: 'Bạn tìm thấy danh sách người bị đưa đi “làm việc riêng”.',
        effects: effects({ health: 0, energy: -6, mental: -8, guilt: -2, empathy: 4, risk: 14, cash: 0, money: 0, messages: 0, reports: 0, minutes: 0 }),
        clue: {
          id: 'missing-workers',
          label: 'Danh sách nhân viên biến mất sau các buổi thẩm vấn',
          source: 'event',
        },
      },
      {
        text: 'Làm như không thấy để bảo toàn mạng sống',
        result: 'Bạn quay mặt đi. Sự im lặng của cả phòng nặng hơn tiếng quạt.',
        effects: effects({ health: 0, energy: 2, mental: -7, guilt: 6, empathy: -3, risk: -5, cash: 0, money: 0, messages: 0, reports: 0, minutes: 0 }),
      },
    ],
  },
  {
    id: 'victim-callback',
    title: 'NẠN NHÂN GỌI LẠI',
    description:
      'Một máy khác đổ chuông. Nạn nhân ca chiều đang khóc và xin trả lại tiền.',
    minimumDay: 2,
    phase: 'work',
    choices: [
      {
        text: 'Giữ line đủ lâu để ghi lại lời khai',
        result: 'Bạn giữ được một cuộc gọi có thể nối với hồ sơ của compound.',
        effects: effects({ health: 0, energy: -5, mental: -9, guilt: -5, empathy: 7, risk: 13, cash: 0, money: 0, messages: 3, reports: 0, minutes: 25 }),
        clue: {
          id: 'callback-recording',
          label: 'Bản ghi cuộc gọi của nạn nhân từ ca trước',
          source: 'event',
        },
        sendsSignal: true,
      },
      {
        text: 'Cúp máy ngay để tránh bị phát hiện',
        result: 'Màn hình tối lại. Cách an toàn nhất cũng là cách khó thở nhất.',
        effects: effects({ health: 0, energy: -2, mental: -7, guilt: 7, empathy: -4, risk: -6, cash: 0, money: 0, messages: 1, reports: 0, minutes: 10 }),
      },
    ],
  },
]
