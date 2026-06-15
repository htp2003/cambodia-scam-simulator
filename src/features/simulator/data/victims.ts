import type { VictimScenario } from '@/features/simulator/types'

export const VICTIMS_DATABASE: VictimScenario[] = [
  {
    id: 'shipper_tuan',
    name: 'Anh Tuấn',
    avatar: '🛵',
    type: 'Shipper tự do',
    difficulty: 'Dễ',
    description: 'Đang xoay tiền thuốc cho con nên cực kỳ dễ tin vào lời hứa việc nhẹ lương cao.',
    redFlags: [
      'Hứa chuyển khoản thử trước để tạo niềm tin',
      'Ép nạp đơn tiếp theo để mở khóa khoản trước',
      'Đánh vào nỗi sợ mất cơ hội kiếm tiền',
    ],
    clueId: 'File ghi âm: người quản lý ép tăng nạp đơn của anh Tuấn',
    revealWeight: 1,
    observationPrompt:
      'Màn hình bên cạnh hiện cảnh quản lý thúc bạn khóa anh Tuấn vào vòng nạp đơn tiếp theo, dù anh ấy đang van xin xin lại tiền thuốc của con.',
    observationVictimLine:
      'Anh lỡ vay nóng để nạp tiếp rồi, cho anh rút một lần thôi cũng được em ơi...',
    observationChoices: [
      {
        text: 'Lưu bản ghi âm và chụp màn hình yêu cầu của quản lý',
        resultText:
          'Bạn cắm máy ghi âm dưới mép bàn, lưu lại giọng ép doanh số cùng ảnh chụp số tiền anh Tuấn vừa chuyển.',
        heat: 0,
        suspicion: 12,
        stress: 10,
        evidence: 1,
        dirtyMoney: 0,
        cleanMoney: 0,
        note: 'Anh Tuấn vay nóng chỉ để tiếp tục nạp đơn ảo.',
        unlockClue: 'File ghi âm: người quản lý ép tăng nạp đơn của anh Tuấn',
        toast: {
          text: 'Bạn đã giấu được một đoạn ghi âm vào thẻ nhớ riêng.',
          type: 'success',
        },
      },
      {
        text: 'Làm theo quản lý để khỏi bị chú ý',
        resultText:
          'Bạn đẩy tiếp kịch bản lên màn hình. Anh Tuấn câm lặng vài giây rồi vẫn chuyển thêm vì sợ mất khoản trước.',
        heat: 6,
        suspicion: -6,
        stress: 8,
        evidence: 0,
        dirtyMoney: 280,
        cleanMoney: 0,
        note: 'Một phần trong bạn hiểu mình vừa góp tay đẩy thêm nợ cho người khác.',
      },
      {
        text: 'Lén gửi tin nhắn cảnh báo bằng kênh phụ',
        resultText:
          'Bạn đánh liều báo anh Tuấn ngắt liên lạc và giữ lại biên lai. Tin nhắn đi được nhưng camera trên trần cũng xoay nhẹ về phía bàn bạn.',
        heat: 10,
        suspicion: 20,
        stress: 14,
        evidence: 1,
        dirtyMoney: -80,
        cleanMoney: 0,
        note: 'Anh Tuấn đã được cảnh báo phải giữ lại biên lai chuyển khoản.',
        toast: {
          text: 'Bạn vừa can thiệp thật sự. Hệ thống bắt đầu chú ý.',
          type: 'warning',
        },
      },
    ],
    script: [
      {
        scammer:
          'Chào anh Tuấn, em bên bộ phận tuyển cộng tác viên xử lý đơn hàng. Chỉ cần điện thoại và vài phút rảnh là có hoa hồng ngay.',
        victim:
          'Nghe cũng ham đó em, nhưng dạo này lừa đảo nhiều quá. Có phải cọc hay đóng phí gì trước không?',
        choices: [
          {
            text: 'Không cần cọc, em gửi trước 50k để anh tin hệ thống là thật.',
            heat: 2,
            success: 100,
            next: 1,
            dirty: 50,
          },
          {
            text: 'Bên em là đối tác lớn, anh không làm thì người khác làm.',
            heat: 5,
            success: 58,
            next: 2,
            dirty: 0,
          },
        ],
      },
      {
        scammer:
          'Đơn đầu tiên giá 300k thôi anh. Anh nạp vào, năm phút sau hệ thống hoàn 390k cả gốc lẫn thưởng.',
        victim:
          'Anh vừa nhận 50k xong nên cũng đỡ nghi rồi. Thôi được, anh chuyển thử 300k nhé.',
        choices: [
          {
            text: 'Chốt luôn đơn thứ hai trị giá 2 triệu để mở gói hoa hồng cao hơn.',
            heat: 5,
            success: 100,
            next: 3,
            dirty: 300,
          },
          {
            text: 'Bảo anh nhập sai cú pháp, yêu cầu chuyển lại thêm 300k.',
            heat: 10,
            success: 42,
            next: 4,
            dirty: 300,
          },
        ],
      },
      {
        scammer:
          'Anh bỏ lỡ thì phí lắm, người ta đang tranh nhau suất này. Quyết nhanh đi anh.',
        victim: 'Thôi thôi, nghe gấp gáp quá rồi. Tôi block đây.',
        choices: [
          {
            text: 'Cắt liên lạc ngay để tránh bị bám số.',
            heat: 2,
            success: 100,
            next: -1,
            dirty: 0,
          },
        ],
      },
      {
        scammer:
          'Tài khoản anh đang bị treo xác minh. Muốn rút, anh phải nạp thêm 3 triệu tiền duy trì thanh khoản ngay bây giờ.',
        victim:
          'Số đó là tiền thuốc cho con anh đó em. Làm ơn cho anh rút trước rồi anh gửi phí sau được không?',
        choices: [
          {
            text: 'Dọa khóa vĩnh viễn nếu không nạp trong 10 phút.',
            heat: 18,
            success: 72,
            next: 5,
            dirty: 2_000,
          },
          {
            text: 'Gợi ý anh vay app nóng để kịp nạp cho đủ.',
            heat: 30,
            success: 45,
            next: 5,
            dirty: 4_000,
          },
        ],
      },
      {
        scammer: 'Anh sai thao tác rồi. Chuyển lại lần nữa đi.',
        victim: 'Đừng hòng. Tôi đọc đúng bài này trên báo rồi.',
        choices: [
          {
            text: 'Đốt số rác, ngắt kênh ngay.',
            heat: 18,
            success: 100,
            next: -1,
            dirty: 0,
          },
        ],
      },
      {
        scammer: 'Hệ thống đang đối soát. Anh chờ thêm đi.',
        victim: 'Nếu mất số tiền này chắc tôi gục mất. Đừng làm vậy với gia đình tôi.',
        choices: [
          {
            text: 'Block toàn bộ, kết thúc ca xử lý.',
            heat: 24,
            success: 100,
            next: -1,
            dirty: 3_800,
          },
        ],
      },
    ],
  },
  {
    id: 'xuan_retired',
    name: 'Bác Xuân',
    avatar: '👵',
    type: 'Cán bộ hưu trí',
    difficulty: 'Khó',
    description: 'Có tiền tích cóp cả đời nhưng rất sợ dính đến pháp luật nên dễ bị hù dọa.',
    redFlags: [
      'Giả danh công an để tạo áp lực pháp lý',
      'Buộc nạn nhân giữ bí mật với người thân',
      'Ép chuyển toàn bộ tiền vào tài khoản “an toàn”',
    ],
    clueId: 'Ảnh chụp bảng KPI giả danh công an treo sau lưng tổ trưởng',
    revealWeight: 1,
    observationPrompt:
      'Trong camera nội bộ, bạn thấy tổ trưởng dán bảng KPI “giả danh công an” và đọc cho cả phòng một kịch bản mới để dồn bác Xuân rút sổ tiết kiệm.',
    observationVictimLine:
      'Tôi chỉ có cuốn sổ dưỡng già này thôi, xin các chú đừng làm tôi hoảng quá...',
    observationChoices: [
      {
        text: 'Lén chụp bảng KPI và lịch phân vai giả danh công an',
        resultText:
          'Bạn ghé màn hình phụ, lưu được ảnh bảng KPI với tên từng người đóng vai điều tra viên và mức thưởng theo từng khoản chuyển tiền.',
        heat: 0,
        suspicion: 14,
        stress: 11,
        evidence: 1,
        dirtyMoney: 0,
        cleanMoney: 0,
        note: 'Có bảng KPI nội bộ cho kịch bản giả danh công an.',
        unlockClue: 'Ảnh chụp bảng KPI giả danh công an treo sau lưng tổ trưởng',
      },
      {
        text: 'Im lặng làm việc, ghi nhớ quy trình để sau tính tiếp',
        resultText:
          'Bạn không bấm gì ngoài các câu lệnh được giao. Ca trực trôi qua êm nhưng hình ảnh bác Xuân run tay vẫn bám lấy bạn.',
        heat: 4,
        suspicion: -8,
        stress: 7,
        evidence: 0,
        dirtyMoney: 180,
        cleanMoney: 0,
        note: 'Bạn sống sót thêm một nhịp nhưng chưa mang ra được gì.',
      },
      {
        text: 'Cố kéo dài thời gian để bác Xuân kịp gọi người thân',
        resultText:
          'Bạn giả vờ lỗi mạng và kéo dài thao tác xác minh. Bác Xuân tranh thủ gọi được cho con trai, nhưng supervisor bắt đầu dò xem ai làm chậm line.',
        heat: 8,
        suspicion: 18,
        stress: 13,
        evidence: 1,
        dirtyMoney: -120,
        cleanMoney: 0,
        note: 'Bác Xuân đã kịp liên lạc con trai trước khi chuyển toàn bộ tiền.',
        toast: {
          text: 'Ca trực trở nên căng thẳng hơn rõ rệt.',
          type: 'warning',
        },
      },
    ],
    script: [
      {
        scammer:
          'A lô, tôi là điều tra viên Nguyễn Minh. Chứng minh thư của bà đang liên quan đến một tài khoản rửa tiền xuyên biên giới.',
        victim:
          'Trời ơi oan quá chú ơi. Tôi cả đời chỉ đi dạy học, chưa bao giờ đụng đến chuyện phạm pháp.',
        choices: [
          {
            text: 'Yêu cầu bà giữ bí mật tuyệt đối để phục vụ chuyên án.',
            heat: 12,
            success: 84,
            next: 1,
            dirty: 0,
          },
          {
            text: 'Ra lệnh rút ngay toàn bộ tiền sang tài khoản bảo an.',
            heat: 20,
            success: 48,
            next: 2,
            dirty: 0,
          },
        ],
      },
      {
        scammer:
          'Muốn chứng minh trong sạch, bà phải rút toàn bộ sổ tiết kiệm chuyển sang tài khoản bảo an để giám định dòng tiền.',
        victim:
          'Tôi có 300 triệu dưỡng già thôi. Nếu thật sự cần hợp tác thì tôi ra ngân hàng ngay bây giờ.',
        choices: [
          {
            text: 'Dọa bắt giam khẩn cấp nếu bà dám báo người thân.',
            heat: 22,
            success: 90,
            next: 3,
            dirty: 8_000,
          },
          {
            text: 'Gửi app giả “cổng thông tin điều tra” để lấy OTP.',
            heat: 30,
            success: 70,
            next: 4,
            dirty: 15_000,
          },
        ],
      },
      {
        scammer: 'Chuyển tiền ngay để phục vụ thanh tra.',
        victim: 'Con trai tôi là luật sư. Nó nói các chú giả mạo rồi.',
        choices: [
          {
            text: 'Cắt line và hủy SIM rác.',
            heat: 20,
            success: 100,
            next: -1,
            dirty: 0,
          },
        ],
      },
      {
        scammer: 'Đã ghi nhận tiền vào tài khoản bảo an.',
        victim: 'Khi nào các chú trả lại cho tôi? Đó là số tiền cả đời tôi tích cóp.',
        choices: [
          {
            text: 'Cho line khác rút tiền mặt rồi đóng hồ sơ.',
            heat: 28,
            success: 100,
            next: -1,
            dirty: 12_000,
          },
        ],
      },
      {
        scammer: 'Nhập OTP vào app để hoàn tất giám định trực tuyến.',
        victim: 'Sao điện thoại tôi tối đen rồi tiền cứ trừ liên tục vậy?',
        choices: [
          {
            text: 'Kích hoạt chiếm quyền điều khiển và rút sạch.',
            heat: 34,
            success: 94,
            next: -1,
            dirty: 28_000,
          },
        ],
      },
    ],
  },
  {
    id: 'vy_student',
    name: 'Vy Vy',
    avatar: '💃',
    type: 'Sinh viên năm hai',
    difficulty: 'Trung bình',
    description: 'Thích khoe cuộc sống sang chảnh và rất dễ bị hút bởi các màn trình diễn giàu có.',
    redFlags: [
      'Dựng hình ảnh giàu sang để làm mồi romance scam',
      'Cho thắng thử trên tài khoản demo',
      'Ép nộp thêm thuế và phí để “rút lợi nhuận”',
    ],
    clueId: 'Ảnh ví crypto lạnh chứa tiền của nạn nhân được chuyển ca mỗi tối',
    revealWeight: 1,
    observationPrompt:
      'Bạn thấy line romance scam đang cho Vy Vy xem tài khoản lời giả trên sàn và chuẩn bị chuyển tiền qua ví lạnh của tổ.',
    observationVictimLine:
      'Nếu em nộp thêm thuế thì mai em rút ra được hết đúng không anh?',
    observationChoices: [
      {
        text: 'Chụp địa chỉ ví lạnh và thời điểm đổi ca chuyển tiền',
        resultText:
          'Bạn lặng lẽ chụp màn hình ví lạnh cùng lịch đổi ca rút USDT, thứ có thể nối toàn bộ dòng tiền với căn phòng này.',
        heat: 0,
        suspicion: 16,
        stress: 12,
        evidence: 1,
        dirtyMoney: 0,
        cleanMoney: 0,
        note: 'Ví lạnh được đổi ca chuyển tiền vào gần sáng mỗi ngày.',
        unlockClue: 'Ảnh ví crypto lạnh chứa tiền của nạn nhân được chuyển ca mỗi tối',
      },
      {
        text: 'Đẩy nốt kịch bản để không lộ ý định',
        resultText:
          'Bạn tiếp tục vai diễn bình thường. Vy Vy tin mình chỉ còn cách nộp thêm một lần nữa để rút toàn bộ khoản “lãi”.',
        heat: 5,
        suspicion: -5,
        stress: 9,
        evidence: 0,
        dirtyMoney: 220,
        cleanMoney: 0,
        note: 'Bạn giữ được mặt nạ nhưng mất thêm một nhịp để cứu ai đó.',
      },
      {
        text: 'Lén gợi Vy Vy kiểm tra ví trên diễn đàn cảnh báo lừa đảo',
        resultText:
          'Bạn nhét vào một câu rất nhỏ để cô ấy tự tra cứu. Vy Vy dừng lại, còn supervisor thì bắt đầu nhìn log chat với vẻ khó chịu.',
        heat: 6,
        suspicion: 18,
        stress: 15,
        evidence: 1,
        dirtyMoney: -100,
        cleanMoney: 0,
        note: 'Vy Vy đã bị khựng lại trước khi nộp thêm khoản thuế giả.',
        toast: {
          text: 'Một nạn nhân vừa chậm lại. Người giám sát không thích điều đó.',
          type: 'warning',
        },
      },
    ],
    script: [
      {
        scammer:
          'Anh thấy gu thẩm mỹ của em trên Instagram rất xịn. Anh đang quản lý quỹ tài sản số ở Singapore, muốn làm quen với em.',
        victim:
          'Ôi nghe sang ghê. Em cũng thích đầu tư mà chưa có ai chỉ cho bài bản hết.',
        choices: [
          {
            text: 'Khoe tài khoản demo lãi liên tục và mời em vào thử.',
            heat: 4,
            success: 82,
            next: 1,
            dirty: 0,
          },
          {
            text: 'Rủ em đi làm nhiệm vụ hoa hồng bằng USDT ngay từ đầu.',
            heat: 8,
            success: 55,
            next: 2,
            dirty: 0,
          },
        ],
      },
      {
        scammer:
          'Anh nạp sẵn cho em 500 đô trong tài khoản demo. Em chỉ việc bấm theo lệnh, thắng thì tự xem.',
        victim:
          'Trời ơi nó lên thật nè. Nếu em nạp tiền thật thì có lời nhanh như vậy không anh?',
        choices: [
          {
            text: 'Khuyên em vào gói VIP 2.000 đô để nhân đôi tốc độ.',
            heat: 10,
            success: 86,
            next: 3,
            dirty: 1_000,
          },
          {
            text: 'Cho em vào gói sinh viên 500 đô để đỡ nghi hơn.',
            heat: 6,
            success: 94,
            next: 3,
            dirty: 500,
          },
        ],
      },
      {
        scammer: 'Em nạp USDT vào ví này rồi anh hướng dẫn tiếp.',
        victim: 'Em tra trên mạng thấy ví này bị cảnh báo rồi mà anh?',
        choices: [
          {
            text: 'Bảo đó là tin bôi xấu từ đối thủ.',
            heat: 14,
            success: 52,
            next: 1,
            dirty: 0,
          },
          {
            text: 'Cắt sớm để tìm mục tiêu khác nhẹ dạ hơn.',
            heat: 3,
            success: 100,
            next: -1,
            dirty: 0,
          },
        ],
      },
      {
        scammer:
          'Tài khoản em vừa lãi lớn rồi. Muốn rút thì em phải nộp trước 25 phần trăm thuế thu nhập quốc tế.',
        victim:
          'Em không có sẵn từng ấy tiền đâu. Nhưng nếu nộp xong rút được liền thì em sẽ vay bạn bè.',
        choices: [
          {
            text: 'Hối em nộp thêm ngay kẻo lệnh rút bị hủy.',
            heat: 24,
            success: 68,
            next: 4,
            dirty: 2_200,
          },
          {
            text: 'Bảo em cầm xe máy để đủ tiền thuế giả.',
            heat: 34,
            success: 48,
            next: 4,
            dirty: 3_300,
          },
        ],
      },
      {
        scammer: 'Sàn đang kiểm tra hồ sơ rút tiền của em.',
        victim: 'Anh đừng block em. Đó là tiền học phí của em thật đó.',
        choices: [
          {
            text: 'Xóa toàn bộ tài khoản ảo và khép lại vụ này.',
            heat: 26,
            success: 100,
            next: -1,
            dirty: 4_600,
          },
        ],
      },
    ],
  },
]
