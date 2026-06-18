import type { ChoiceEffects, TargetDefinition } from '@/features/simulator/types'

const effects = (values: ChoiceEffects): ChoiceEffects => values

export const TARGETS: TargetDefinition[] = [
  {
    id: 'shipper_tuan',
    name: 'Anh Tuấn',
    avatar: '🛵',
    age: 35,
    job: 'Shipper tự do',
    location: 'TP.HCM',
    difficulty: 'Dễ',
    description: 'Đang xoay tiền thuốc cho con và tìm việc làm thêm vào buổi tối.',
    weakness: 'Áp lực viện phí, sợ bỏ lỡ cơ hội kiếm tiền',
    redFlags: [
      'Chuyển khoản thử để tạo niềm tin',
      'Ép nạp đơn tiếp theo để mở khóa khoản trước',
      'Gợi ý vay nóng khi nạn nhân hết tiền',
    ],
    researchFinding:
      'Một bài đăng cũ cho thấy anh đang vay tiền thuốc cho con. Quản lý đánh dấu đây là điểm có thể gây áp lực.',
    clueId: 'tuan-audio',
    scenes: [
      {
        playerLine:
          'Chào anh Tuấn, em bên bộ phận tuyển cộng tác viên xử lý đơn hàng. Chỉ cần điện thoại là có hoa hồng.',
        targetLine:
          'Nghe cũng ham đó em, nhưng dạo này lừa đảo nhiều quá. Có phải đóng phí gì trước không?',
        choices: [
          {
            text: 'Chuyển thử 50k để tạo niềm tin rồi mời anh làm đơn đầu.',
            effects: effects({ money: 250, messages: 5, trust: 14, suspicion: -4, risk: 4, guilt: 7, empathy: -3, energy: -6, health: 0, mental: -3, minutes: 45 }),
            nextScene: 1,
          },
          {
            text: 'Cảnh báo đây là line lừa đảo và bảo anh giữ tiền chữa bệnh.',
            effects: effects({ money: 0, messages: 3, trust: 8, suspicion: 6, risk: 14, guilt: -10, empathy: 12, energy: -5, health: 0, mental: 2, minutes: 35 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'tuan-audio',
            sendsSignal: true,
          },
        ],
      },
      {
        playerLine:
          'Đơn đầu giá 300k. Anh nạp vào, năm phút sau hệ thống hoàn cả gốc lẫn thưởng.',
        targetLine: 'Anh vừa nhận 50k nên cũng đỡ nghi. Thôi được, anh chuyển thử.',
        choices: [
          {
            text: 'Khóa khoản rút và ép anh nạp thêm hai triệu.',
            effects: effects({ money: 1200, messages: 7, trust: -4, suspicion: 16, risk: 10, guilt: 16, empathy: -8, energy: -8, health: 0, mental: -7, minutes: 55 }),
            nextScene: 2,
          },
          {
            text: 'Dừng kịch bản, bảo anh chụp lại toàn bộ biên lai.',
            effects: effects({ money: 0, messages: 3, trust: 12, suspicion: 8, risk: 16, guilt: -12, empathy: 14, energy: -6, health: 0, mental: 3, minutes: 40 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'tuan-audio',
            sendsSignal: true,
          },
        ],
      },
      {
        playerLine: 'Muốn rút tiền, anh phải nạp thêm tiền duy trì thanh khoản ngay.',
        targetLine: 'Số đó là tiền thuốc cho con anh. Làm ơn cho anh rút trước được không?',
        choices: [
          {
            text: 'Gợi ý anh vay app nóng để hoàn thành đơn.',
            effects: effects({ money: 1800, messages: 6, trust: -12, suspicion: 24, risk: 18, guilt: 24, empathy: -14, energy: -8, health: 0, mental: -12, minutes: 50 }),
            nextScene: null,
            outcome: 'closed',
          },
          {
            text: 'Cắt line và lén lưu đoạn quản lý ép tăng nạp.',
            effects: effects({ money: 0, messages: 2, trust: 8, suspicion: 10, risk: 18, guilt: -14, empathy: 16, energy: -7, health: 0, mental: 2, minutes: 35 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'tuan-audio',
          },
        ],
      },
    ],
  },
  {
    id: 'xuan_retired',
    name: 'Bác Xuân',
    avatar: '👵',
    age: 67,
    job: 'Giáo viên hưu trí',
    location: 'Hà Nội',
    difficulty: 'Khó',
    description: 'Có tiền tích cóp cả đời nhưng rất sợ dính đến pháp luật.',
    weakness: 'Sợ bị bắt, dễ hoảng khi bị cô lập khỏi người thân',
    redFlags: [
      'Giả danh công an để tạo áp lực pháp lý',
      'Buộc nạn nhân giữ bí mật với gia đình',
      'Ép chuyển tiền vào tài khoản “an toàn”',
    ],
    researchFinding:
      'Hồ sơ rò rỉ ghi rõ bác sống một mình và có con trai làm luật sư. Quản lý yêu cầu ngăn bác gọi cho con.',
    clueId: 'fake-police-kpi',
    scenes: [
      {
        playerLine:
          'Tôi là điều tra viên Nguyễn Minh. Chứng minh thư của bà liên quan đến một tài khoản rửa tiền.',
        targetLine: 'Trời ơi oan quá chú ơi. Tôi cả đời chỉ đi dạy học.',
        choices: [
          {
            text: 'Yêu cầu giữ bí mật tuyệt đối để phục vụ chuyên án.',
            effects: effects({ money: 0, messages: 6, trust: 10, suspicion: 5, risk: 7, guilt: 10, empathy: -5, energy: -7, health: 0, mental: -5, minutes: 50 }),
            nextScene: 1,
          },
          {
            text: 'Nói mã xác minh giả và bảo bác gọi ngay cho con trai.',
            effects: effects({ money: 0, messages: 3, trust: 5, suspicion: 12, risk: 18, guilt: -12, empathy: 15, energy: -6, health: 0, mental: 2, minutes: 40 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'fake-police-kpi',
            sendsSignal: true,
          },
        ],
      },
      {
        playerLine:
          'Muốn chứng minh trong sạch, bà phải chuyển sổ tiết kiệm sang tài khoản bảo an.',
        targetLine: 'Tôi chỉ có khoản dưỡng già. Nếu thật sự cần thì tôi ra ngân hàng.',
        choices: [
          {
            text: 'Dọa bắt giam nếu bác báo cho người thân.',
            effects: effects({ money: 2100, messages: 8, trust: -5, suspicion: 16, risk: 14, guilt: 22, empathy: -12, energy: -9, health: 0, mental: -10, minutes: 65 }),
            nextScene: 2,
          },
          {
            text: 'Giả vờ lỗi mạng để bác có thời gian gọi con.',
            effects: effects({ money: 0, messages: 4, trust: 8, suspicion: 12, risk: 20, guilt: -14, empathy: 17, energy: -8, health: 0, mental: 1, minutes: 55 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'fake-police-kpi',
          },
        ],
      },
      {
        playerLine: 'Đã ghi nhận tiền vào tài khoản bảo an.',
        targetLine: 'Khi nào các chú trả lại? Đó là tiền cả đời tôi tích cóp.',
        choices: [
          {
            text: 'Đóng hồ sơ và chuyển tiền cho line rút mặt.',
            effects: effects({ money: 3200, messages: 5, trust: -18, suspicion: 28, risk: 22, guilt: 28, empathy: -16, energy: -8, health: 0, mental: -14, minutes: 45 }),
            nextScene: null,
            outcome: 'closed',
          },
          {
            text: 'Lưu ảnh bảng KPI giả danh công an rồi ngắt line.',
            effects: effects({ money: 0, messages: 2, trust: 6, suspicion: 12, risk: 22, guilt: -12, empathy: 15, energy: -7, health: 0, mental: 0, minutes: 35 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'fake-police-kpi',
          },
        ],
      },
    ],
  },
  {
    id: 'vy_student',
    name: 'Vy Vy',
    avatar: '💃',
    age: 20,
    job: 'Sinh viên năm hai',
    location: 'Đà Nẵng',
    difficulty: 'Trung bình',
    description: 'Bị hút bởi hình ảnh giàu có và các lời mời đầu tư tài sản số.',
    weakness: 'Áp lực thể hiện bản thân, thiếu kinh nghiệm tài chính',
    redFlags: [
      'Dựng hình ảnh giàu sang làm mồi romance scam',
      'Cho thắng thử trên tài khoản demo',
      'Ép nộp thuế giả để rút lợi nhuận',
    ],
    researchFinding:
      'Tài khoản của Vy đăng công khai lịch học và chiếc xe đang trả góp. Line trưởng định dùng cả hai để ép cô vay tiền.',
    clueId: 'cold-wallet-photo',
    scenes: [
      {
        playerLine:
          'Anh quản lý quỹ tài sản số ở Singapore. Thấy gu của em rất xịn nên muốn làm quen.',
        targetLine: 'Nghe sang ghê. Em cũng thích đầu tư mà chưa có ai chỉ.',
        choices: [
          {
            text: 'Khoe tài khoản demo lãi liên tục và mời em thử.',
            effects: effects({ money: 0, messages: 6, trust: 13, suspicion: -2, risk: 5, guilt: 7, empathy: -4, energy: -6, health: 0, mental: -3, minutes: 45 }),
            nextScene: 1,
          },
          {
            text: 'Gài một câu để cô tự tra địa chỉ ví trên diễn đàn cảnh báo.',
            effects: effects({ money: 0, messages: 3, trust: 6, suspicion: 8, risk: 14, guilt: -9, empathy: 12, energy: -5, health: 0, mental: 2, minutes: 35 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'cold-wallet-photo',
          },
        ],
      },
      {
        playerLine:
          'Anh nạp sẵn 500 đô trong tài khoản demo. Em chỉ việc bấm theo lệnh.',
        targetLine: 'Nó lên thật nè. Nếu em nạp tiền thật thì có lời nhanh vậy không?',
        choices: [
          {
            text: 'Mời vào gói VIP hai nghìn đô.',
            effects: effects({ money: 1000, messages: 7, trust: 9, suspicion: 8, risk: 9, guilt: 13, empathy: -7, energy: -7, health: 0, mental: -6, minutes: 55 }),
            nextScene: 2,
          },
          {
            text: 'Cho gói sinh viên nhỏ rồi lén gửi link cảnh báo.',
            effects: effects({ money: 300, messages: 5, trust: 8, suspicion: 7, risk: 16, guilt: -6, empathy: 12, energy: -7, health: 0, mental: 1, minutes: 50 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'cold-wallet-photo',
            sendsSignal: true,
          },
        ],
      },
      {
        playerLine:
          'Tài khoản đã có lãi. Muốn rút thì em phải nộp trước thuế thu nhập quốc tế.',
        targetLine: 'Đó là tiền học phí. Nếu nộp xong rút được thì em sẽ vay bạn.',
        choices: [
          {
            text: 'Hối nộp ngay trước khi lệnh rút bị hủy.',
            effects: effects({ money: 2400, messages: 7, trust: -9, suspicion: 20, risk: 18, guilt: 22, empathy: -13, energy: -8, health: 0, mental: -11, minutes: 55 }),
            nextScene: null,
            outcome: 'closed',
          },
          {
            text: 'Chụp địa chỉ ví lạnh và bảo cô dừng chuyển tiền.',
            effects: effects({ money: 0, messages: 3, trust: 10, suspicion: 12, risk: 20, guilt: -13, empathy: 16, energy: -7, health: 0, mental: 1, minutes: 40 }),
            nextScene: null,
            outcome: 'helped',
            clueId: 'cold-wallet-photo',
          },
        ],
      },
    ],
  },
]
