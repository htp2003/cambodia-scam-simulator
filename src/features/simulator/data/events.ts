import type { RandomEventDefinition } from '@/features/simulator/types'

export const RANDOM_EVENTS: RandomEventDefinition[] = [
  {
    id: 'generator-flicker',
    title: 'MẤT NHỊP ĐIỆN HÀNH LANG',
    description:
      'Điện trong khu nhà chập chờn vài giây. Supervisor quát cả phòng phải giữ doanh số, nhưng camera cũng vừa tắt đúng một nhịp ngắn.',
    conditions: {
      phases: ['scam'],
    },
    choices: [
      {
        text: 'Tranh thủ chép nhanh vài log chat sang chỗ riêng',
        onSuccess: [
          { type: 'adjustSuspicion', amount: 8 },
          { type: 'adjustStress', amount: 6 },
          { type: 'adjustEvidence', amount: 1 },
          {
            type: 'addNote',
            note: 'Mỗi lần máy phát điện chập, camera trần dừng ghi khoảng ba giây.',
          },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn tranh thủ lưu được vài dòng log trước khi điện ổn định trở lại.',
              color: 'text-cyan-400',
            },
          },
        ],
      },
      {
        text: 'Ngồi im và tiếp tục chạy kịch bản như chưa có gì',
        onSuccess: [
          { type: 'adjustHeat', amount: 4 },
          { type: 'adjustSuspicion', amount: -4 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn chọn im lặng để giữ vị trí. Ca trực trôi đi nhưng cơn khó chịu không biến mất.',
              color: 'text-slate-400',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'patrol-sweep',
    title: 'ĐỢT KIỂM TRA HÀNH CHÍNH',
    description:
      'Bảo vệ nội khu nhắn trước: tối nay có người đi kiểm tra đột xuất giấy tờ và phòng máy. Ai bị ghim sẽ phải ngồi riêng với quản lý.',
    conditions: {
      phases: ['scam'],
      minimumHeat: 16,
    },
    choices: [
      {
        text: 'Dùng tiền sạch bôi trơn để tên bạn không bị gọi ra',
        requirements: {
          currency: 'clean',
          minimumAmount: 250,
        },
        onSuccess: [
          { type: 'adjustMoney', currency: 'clean', amount: -250 },
          { type: 'adjustHeat', amount: -12 },
          {
            type: 'addLog',
            entry: {
              text: 'Một khoản bôi trơn nhỏ giúp hồ sơ tạm trú của bạn biến mất khỏi chồng giấy kiểm tra.',
              color: 'text-emerald-400',
            },
          },
        ],
        onFailure: [
          { type: 'adjustHeat', amount: 10 },
          { type: 'adjustStress', amount: 8 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn không đủ tiền sạch để dập sóng. Tên bạn bị giữ lại trong danh sách cần để mắt.',
              color: 'text-rose-500',
            },
          },
        ],
      },
      {
        text: 'Giấu điện thoại phụ và chịu bị soi thêm một nhịp',
        onSuccess: [
          { type: 'adjustSuspicion', amount: 10 },
          { type: 'adjustStress', amount: 10 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn ôm chặt ngăn bàn. Đợt kiểm tra qua đi nhưng ánh mắt supervisor bắt đầu nán lại lâu hơn.',
              color: 'text-amber-400',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'camera-pivot',
    title: 'CAMERA ĐỔI GÓC QUAY',
    description:
      'Sau cú reveal, bạn nhận ra một camera trần vừa xoay thêm vài độ và giữ nguyên ngay phía trên bàn làm việc của mình.',
    conditions: {
      phases: ['surveillance', 'escape'],
      revealTriggered: true,
    },
    choices: [
      {
        text: 'Hạ tấm lọc màn hình và quay lại log nội bộ',
        requirements: {
          requiredUpgrade: 'screenDimmer',
        },
        onSuccess: [
          { type: 'adjustSuspicion', amount: -12 },
          { type: 'adjustStress', amount: 4 },
          {
            type: 'addLog',
            entry: {
              text: 'Tấm lọc màn hình cứu bạn khỏi góc nhìn trực diện của camera.',
              color: 'text-emerald-400',
            },
          },
        ],
        onFailure: [
          { type: 'adjustSuspicion', amount: 18 },
          { type: 'adjustStress', amount: 8 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn chưa có đủ đồ che màn hình. Camera quét qua, lưu lại một nhịp tay lạ của bạn.',
              color: 'text-rose-500',
            },
          },
        ],
      },
      {
        text: 'Rời mắt khỏi bằng chứng, giả vờ chỉ đang xử lý KPI',
        onSuccess: [
          { type: 'adjustSuspicion', amount: -5 },
          { type: 'adjustStress', amount: 6 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn giữ được vẻ bình thản, nhưng lại bỏ lỡ thêm một cơ hội để lưu thứ quan trọng.',
              color: 'text-slate-400',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'coworker-missing',
    title: 'MỘT BÀN LÀM VIỆC BỖNG TRỐNG',
    description:
      'Bàn cạnh bạn đột nhiên bị dọn sạch. Không ai nhắc tên người vừa biến mất, chỉ còn màn hình đăng nhập treo trơ trọi.',
    conditions: {
      phases: ['surveillance'],
      minimumSuspicion: 12,
    },
    choices: [
      {
        text: 'Lén kiểm tra máy người đó trước khi ca trưởng quay lại',
        onSuccess: [
          { type: 'adjustSuspicion', amount: 14 },
          { type: 'adjustStress', amount: 10 },
          { type: 'adjustEvidence', amount: 1 },
          {
            type: 'unlockClue',
            clue: 'Danh sách ca trực bị đưa đi “làm việc riêng” sau khi ghi log nội bộ',
          },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn lôi ra được danh sách ca trực bị gọi đi rồi biến mất khỏi khu nhà.',
              color: 'text-cyan-400',
            },
          },
        ],
      },
      {
        text: 'Làm như không thấy gì để bảo toàn mạng sống',
        onSuccess: [
          { type: 'adjustStress', amount: 12 },
          { type: 'adjustSuspicion', amount: -4 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn không dám ngó sang. Sự im lặng của cả phòng còn nặng hơn tiếng quạt trần.',
              color: 'text-amber-400',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'victim-callback',
    title: 'NẠN NHÂN GỌI LẠI',
    description:
      'Một máy khác đổ chuông liên tục. Nạn nhân từ ca chiều đã tìm được số phụ và đang khóc lóc xin trả lại tiền.',
    conditions: {
      phases: ['surveillance', 'escape'],
      minimumEvidence: 1,
      revealTriggered: true,
    },
    choices: [
      {
        text: 'Bật máy ghi âm, giữ line càng lâu càng tốt',
        requirements: {
          requiredUpgrade: 'audioRecorder',
        },
        onSuccess: [
          { type: 'adjustEvidence', amount: 1 },
          { type: 'adjustSuspicion', amount: 10 },
          { type: 'adjustStress', amount: 12 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn giữ lại được thêm một cuộc gọi tuyệt vọng có thể dùng làm bằng chứng.',
              color: 'text-emerald-400',
            },
          },
        ],
        onFailure: [
          { type: 'adjustStress', amount: 10 },
          { type: 'adjustSuspicion', amount: 12 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn chưa có máy ghi âm nhưng vẫn đứng khựng lại quá lâu trước cuộc gọi ấy.',
              color: 'text-rose-500',
            },
          },
        ],
      },
      {
        text: 'Cúp máy ngay để tránh bị phát hiện',
        onSuccess: [
          { type: 'adjustSuspicion', amount: -6 },
          { type: 'adjustStress', amount: 8 },
          {
            type: 'addLog',
            entry: {
              text: 'Bạn bấm ngắt và nhìn màn hình tối lại. Cách an toàn nhất cũng là cách khó thở nhất.',
              color: 'text-slate-400',
            },
          },
        ],
      },
    ],
  },
]
