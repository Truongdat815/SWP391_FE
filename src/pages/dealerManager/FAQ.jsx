import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị trang Câu hỏi thường gặp (FAQ) cho Dealer Manager
 * 
 * Component này cung cấp danh sách các câu hỏi thường gặp và giải pháp
 * cho các vấn đề trong quản lý, bao gồm: quản lý kho, đơn hàng, nhân viên,
 * khuyến mãi, báo cáo và các vấn đề hệ thống.
 * 
 * Tính năng:
 * - Tìm kiếm FAQ theo từ khóa
 * - Mở rộng/thu gọn câu hỏi để xem chi tiết
 * - Phân loại FAQ theo danh mục
 * - Hiển thị câu trả lời và các bước xử lý
 * 
 * @component
 * @returns {JSX.Element} Component hiển thị danh sách FAQ
 * 
 * @example
 * <FAQ />
 */
const FAQ = () => {
  /**
   * Hook React Router để điều hướng giữa các trang
   * @type {Function}
   */
  const navigate = useNavigate();
  
  /**
   * State lưu trữ từ khóa tìm kiếm FAQ
   * @type {[string, Function]}
   * @default ''
   */
  const [searchQuery, setSearchQuery] = useState('');
  
  /**
   * State lưu trữ trạng thái mở rộng/thu gọn của các FAQ item
   * Key là id của FAQ item, value là boolean (true = đang mở, false = đang đóng)
   * @type {[Object<string, boolean>, Function]}
   * @default {}
   * @example { 1: true, 2: false }
   */
  const [expandedItems, setExpandedItems] = useState({});

  /**
   * Hàm chuyển đổi trạng thái mở rộng/thu gọn của một FAQ item
   * 
   * @param {number} id - Mã định danh của FAQ item cần chuyển đổi trạng thái
   * @returns {void}
   * 
   * @example
   * toggleExpand(1); // Mở hoặc đóng FAQ item có id = 1
   */
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  /**
   * Mảng chứa danh sách các danh mục FAQ và các câu hỏi trong mỗi danh mục
   * 
   * @type {Array<Object>}
   * @property {string} category - Tên danh mục FAQ
   * @property {string} icon - Icon emoji đại diện cho danh mục
   * @property {Array<Object>} items - Mảng các câu hỏi trong danh mục
   * @property {number} items[].id - Mã định danh duy nhất của câu hỏi
   * @property {string} items[].question - Nội dung câu hỏi
   * @property {string} items[].answer - Câu trả lời chi tiết
   * @property {Array<string>} items[].solutions - Mảng các bước xử lý/giải pháp
   */
  const faqCategories = [
    {
      category: "Vấn đề về quản lý kho",
      icon: "📦",
      items: [
        {
          id: 1,
          question: "Làm thế nào để cập nhật số lượng tồn kho?",
          answer: "Vào mục 'Quản lý kho' → Chọn sản phẩm cần cập nhật → Nhấn 'Chỉnh sửa' → Cập nhật số lượng → Lưu. Bạn cũng có thể tạo giao dịch nhập/xuất kho để cập nhật tự động.",
          solutions: [
            "Kiểm tra số lượng hiện tại trước khi cập nhật",
            "Tạo giao dịch nhập kho khi nhận được hàng từ EVM",
            "Tạo giao dịch xuất kho khi bán hàng hoặc điều chuyển",
            "Kiểm tra lại số lượng sau khi cập nhật",
            "Liên hệ EVM Staff nếu có sai sót về số lượng"
          ]
        },
        {
          id: 2,
          question: "Không thể cập nhật giá bán cho sản phẩm",
          answer: "Kiểm tra quyền hạn và trạng thái sản phẩm. Đảm bảo bạn có quyền chỉnh sửa giá và sản phẩm đang hoạt động.",
          solutions: [
            "Kiểm tra quyền quản lý của tài khoản",
            "Xác nhận sản phẩm đang ở trạng thái Active",
            "Kiểm tra giá mới có hợp lệ không (lớn hơn 0)",
            "Làm mới trang và thử lại",
            "Liên hệ EVM Staff nếu vẫn không được"
          ]
        },
        {
          id: 3,
          question: "Làm sao để đặt hàng từ EVM?",
          answer: "Vào mục 'Quản lý kho' → Tab 'Đặt hàng' → 'Đặt hàng từ hãng' → Chọn mẫu xe, màu sắc, số lượng → Điền thông tin → Gửi yêu cầu.",
          solutions: [
            "Kiểm tra tồn kho hiện tại trước khi đặt",
            "Chọn đúng mẫu xe và màu sắc",
            "Nhập số lượng cần đặt",
            "Chọn ngày giao dự kiến",
            "Thêm ghi chú nếu cần",
            "Gửi yêu cầu và theo dõi trạng thái"
          ]
        },
        {
          id: 4,
          question: "Cảnh báo hết hàng không hiển thị đúng",
          answer: "Kiểm tra cài đặt ngưỡng cảnh báo và số lượng tồn kho thực tế.",
          solutions: [
            "Kiểm tra số lượng tồn kho hiện tại",
            "Xem cài đặt ngưỡng cảnh báo (thường là dưới 5 xe)",
            "Cập nhật số lượng tồn kho nếu sai",
            "Làm mới trang để cập nhật cảnh báo",
            "Liên hệ IT support nếu vấn đề tiếp tục"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về quản lý đơn hàng",
      icon: "📋",
      items: [
        {
          id: 5,
          question: "Không thể phê duyệt đơn hàng",
          answer: "Kiểm tra quyền hạn, trạng thái đơn hàng và thông tin đơn hàng có đầy đủ không.",
          solutions: [
            "Xác nhận bạn có quyền phê duyệt đơn hàng",
            "Kiểm tra đơn hàng đang ở trạng thái Pending",
            "Kiểm tra thông tin đơn hàng đã đầy đủ",
            "Kiểm tra tồn kho có đủ hàng không",
            "Làm mới trang và thử lại",
            "Liên hệ IT support nếu vẫn lỗi"
          ]
        },
        {
          id: 6,
          question: "Không thấy đơn hàng của nhân viên",
          answer: "Kiểm tra bộ lọc và quyền truy cập. Đảm bảo bạn có thể xem tất cả đơn hàng của cửa hàng.",
          solutions: [
            "Xóa các bộ lọc đang áp dụng",
            "Kiểm tra bộ lọc theo nhân viên",
            "Kiểm tra quyền truy cập của tài khoản",
            "Làm mới trang (F5)",
            "Liên hệ IT support để kiểm tra quyền"
          ]
        },
        {
          id: 7,
          question: "Làm sao để xuất báo cáo đơn hàng?",
          answer: "Vào mục 'Quản lý đơn hàng' → Chọn bộ lọc → Nhấn 'Xuất báo cáo' → Chọn định dạng (Excel/PDF) → Tải xuống.",
          solutions: [
            "Chọn khoảng thời gian cần báo cáo",
            "Áp dụng các bộ lọc cần thiết",
            "Nhấn nút 'Xuất báo cáo'",
            "Chọn định dạng file (Excel hoặc PDF)",
            "Đợi file được tạo và tải xuống",
            "Kiểm tra file đã tải về đúng chưa"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về quản lý nhân viên",
      icon: "👥",
      items: [
        {
          id: 8,
          question: "Không thể thêm nhân viên mới",
          answer: "Kiểm tra quyền hạn, thông tin đã điền đầy đủ và email/username không trùng.",
          solutions: [
            "Xác nhận bạn có quyền quản lý nhân viên",
            "Kiểm tra các trường bắt buộc đã điền đầy đủ",
            "Xác nhận email và username chưa tồn tại",
            "Kiểm tra định dạng email đúng",
            "Làm mới trang và thử lại",
            "Liên hệ Admin nếu cần tạo tài khoản đặc biệt"
          ]
        },
        {
          id: 9,
          question: "Không thể chỉnh sửa thông tin nhân viên",
          answer: "Kiểm tra quyền hạn và trạng thái tài khoản nhân viên.",
          solutions: [
            "Xác nhận bạn có quyền chỉnh sửa",
            "Kiểm tra nhân viên không bị khóa",
            "Kiểm tra thông tin mới có hợp lệ không",
            "Làm mới trang và thử lại",
            "Liên hệ Admin nếu cần thay đổi thông tin quan trọng"
          ]
        },
        {
          id: 10,
          question: "Làm sao để xem hiệu suất làm việc của nhân viên?",
          answer: "Vào mục 'Quản lý nhân viên' → Chọn nhân viên → Xem tab 'Hiệu suất' hoặc vào 'Báo cáo doanh số' → Lọc theo nhân viên.",
          solutions: [
            "Vào trang chi tiết nhân viên",
            "Xem tab 'Hiệu suất' hoặc 'Thống kê'",
            "Hoặc vào 'Báo cáo doanh số' và lọc theo nhân viên",
            "Xem các chỉ số: Số đơn hàng, Doanh số, Đánh giá",
            "So sánh với các nhân viên khác",
            "Xuất báo cáo nếu cần"
          ]
        },
        {
          id: 11,
          question: "Không thể vô hiệu hóa tài khoản nhân viên",
          answer: "Kiểm tra quyền hạn và đảm bảo nhân viên không đang xử lý đơn hàng quan trọng.",
          solutions: [
            "Xác nhận bạn có quyền quản lý nhân viên",
            "Kiểm tra nhân viên không có đơn hàng đang xử lý",
            "Chuyển đơn hàng cho nhân viên khác nếu cần",
            "Thử vô hiệu hóa lại",
            "Liên hệ Admin nếu vẫn không được"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về khuyến mãi",
      icon: "🎁",
      items: [
        {
          id: 12,
          question: "Không thể tạo khuyến mãi mới",
          answer: "Kiểm tra thông tin đã điền đầy đủ, thời gian hợp lệ và quyền hạn.",
          solutions: [
            "Kiểm tra các trường bắt buộc đã điền",
            "Xác nhận ngày bắt đầu trước ngày kết thúc",
            "Kiểm tra giá trị giảm giá hợp lệ",
            "Kiểm tra quyền tạo khuyến mãi",
            "Làm mới trang và thử lại",
            "Liên hệ EVM Staff nếu cần khuyến mãi đặc biệt"
          ]
        },
        {
          id: 13,
          question: "Khuyến mãi không áp dụng cho đơn hàng",
          answer: "Kiểm tra khuyến mãi đang hoạt động, điều kiện áp dụng và sản phẩm có trong danh sách không.",
          solutions: [
            "Kiểm tra khuyến mãi đang ở trạng thái Active",
            "Xác nhận thời gian khuyến mãi còn hiệu lực",
            "Kiểm tra sản phẩm có trong danh sách áp dụng không",
            "Kiểm tra điều kiện khuyến mãi có đáp ứng không",
            "Liên hệ IT support nếu vẫn không áp dụng được"
          ]
        },
        {
          id: 14,
          question: "Làm sao để dừng khuyến mãi sớm?",
          answer: "Vào mục 'Quản lý khuyến mãi' → Chọn khuyến mãi → 'Tạm dừng' hoặc 'Kết thúc sớm'.",
          solutions: [
            "Vào trang chi tiết khuyến mãi",
            "Nhấn nút 'Tạm dừng' hoặc 'Kết thúc'",
            "Xác nhận hành động",
            "Thông báo cho nhân viên về việc dừng khuyến mãi",
            "Kiểm tra khuyến mãi đã dừng thành công"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về báo cáo",
      icon: "📊",
      items: [
        {
          id: 15,
          question: "Báo cáo doanh số không chính xác",
          answer: "Kiểm tra khoảng thời gian, bộ lọc và dữ liệu đơn hàng. Đảm bảo đơn hàng đã được cập nhật đúng.",
          solutions: [
            "Kiểm tra khoảng thời gian đã chọn đúng",
            "Xem lại các bộ lọc đang áp dụng",
            "Kiểm tra dữ liệu đơn hàng có đầy đủ không",
            "Làm mới trang và tạo lại báo cáo",
            "So sánh với báo cáo kỳ trước",
            "Liên hệ IT support nếu có sai sót lớn"
          ]
        },
        {
          id: 16,
          question: "Không thể xuất báo cáo",
          answer: "Kiểm tra kết nối mạng, trình duyệt và thử lại. Có thể do file quá lớn hoặc lỗi hệ thống.",
          solutions: [
            "Kiểm tra kết nối mạng",
            "Thử xuất lại báo cáo",
            "Chọn khoảng thời gian nhỏ hơn nếu file quá lớn",
            "Thử trình duyệt khác",
            "Xóa cache trình duyệt",
            "Liên hệ IT support nếu vẫn lỗi"
          ]
        },
        {
          id: 17,
          question: "Làm sao để so sánh doanh số giữa các kỳ?",
          answer: "Vào mục 'Báo cáo doanh số' → Chọn chế độ 'So sánh' → Chọn các kỳ cần so sánh → Xem biểu đồ và bảng so sánh.",
          solutions: [
            "Vào mục 'Báo cáo doanh số'",
            "Chọn tab 'So sánh' hoặc 'Comparison'",
            "Chọn các kỳ cần so sánh (ví dụ: Tháng này vs Tháng trước)",
            "Xem biểu đồ và bảng so sánh",
            "Xuất báo cáo so sánh nếu cần",
            "Phân tích sự khác biệt và xu hướng"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về hệ thống",
      icon: "⚙️",
      items: [
        {
          id: 18,
          question: "Dashboard không hiển thị đúng dữ liệu",
          answer: "Có thể do cache trình duyệt hoặc dữ liệu chưa được cập nhật. Làm mới trang và kiểm tra lại.",
          solutions: [
            "Làm mới trang (F5)",
            "Xóa cache và cookies của trình duyệt",
            "Kiểm tra kết nối mạng",
            "Đăng xuất và đăng nhập lại",
            "Kiểm tra thời gian cập nhật dữ liệu",
            "Liên hệ IT support nếu vẫn không đúng"
          ]
        },
        {
          id: 19,
          question: "Không thể đăng nhập vào hệ thống",
          answer: "Kiểm tra thông tin đăng nhập, kết nối mạng và trạng thái tài khoản.",
          solutions: [
            "Kiểm tra tên đăng nhập và mật khẩu",
            "Xác nhận Caps Lock không bật",
            "Thử quên mật khẩu và đặt lại",
            "Kiểm tra kết nối mạng",
            "Xóa cache trình duyệt",
            "Thử trình duyệt khác",
            "Liên hệ IT support để được hỗ trợ"
          ]
        },
        {
          id: 20,
          question: "Dữ liệu không được lưu hoặc bị mất",
          answer: "Có thể do mất kết nối, lỗi hệ thống hoặc chưa nhấn nút lưu. Kiểm tra và thử lại.",
          solutions: [
            "Kiểm tra kết nối mạng",
            "Không đóng trang khi đang lưu",
            "Đảm bảo đã nhấn nút 'Lưu' hoặc 'Xác nhận'",
            "Kiểm tra thông báo lỗi từ hệ thống",
            "Làm mới trang và thử lại",
            "Liên hệ IT support nếu mất dữ liệu quan trọng"
          ]
        }
      ]
    }
  ];

  /**
   * Lọc danh sách FAQ dựa trên từ khóa tìm kiếm
   * Tìm kiếm trong: tên danh mục, câu hỏi, câu trả lời và các bước xử lý
   * 
   * @type {Array<Object>}
   * @returns {Array<Object>} Mảng các danh mục FAQ đã được lọc, chỉ giữ lại
   *                          các danh mục có ít nhất một câu hỏi khớp với từ khóa
   * 
   * @example
   * // Nếu searchQuery = "kho"
   * // Sẽ trả về các FAQ liên quan đến "kho" trong question, answer hoặc solutions
   */
  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.solutions.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Tìm giải pháp cho các vấn đề thường gặp trong quản lý</p>
          </div>
          <button
            onClick={() => navigate('/dealer-manager/help')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi hoặc vấn đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      {filteredFAQs.length > 0 ? (
        <div className="space-y-4 sm:space-y-5">
          {filteredFAQs.map((category) => (
            <div key={category.category} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 sm:px-5 py-3 sm:py-4 border-b border-red-200">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl">{category.icon}</span>
                  {category.category}
                </h2>
              </div>
              
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full px-4 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                      <svg
                        className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                          expandedItems[item.id] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedItems[item.id] && (
                      <div className="px-4 pb-4 sm:pb-5 space-y-3 sm:space-y-4 border-t border-gray-200 bg-gray-50">
                        <div className="pt-3 sm:pt-4">
                          <p className="text-xs sm:text-sm md:text-base text-gray-700 whitespace-pre-line mb-3 sm:mb-4">
                            {item.answer}
                          </p>
                          
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                              <span className="text-red-600">✓</span>
                              Các bước xử lý:
                            </h4>
                            <ul className="space-y-2">
                              {item.solutions.map((solution, index) => (
                                <li key={index} className="flex items-start gap-2 sm:gap-3">
                                  <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 flex-shrink-0"></span>
                                  <span className="text-xs sm:text-sm text-gray-700">{solution}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
          <svg className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-xs sm:text-sm text-gray-600">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">📞</span>
          Vẫn chưa tìm thấy giải pháp?
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-3 sm:mb-4">
          Liên hệ với đội ngũ hỗ trợ để được giúp đỡ nhanh chóng:
        </p>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base">
          <div className="flex items-center gap-2 sm:gap-3">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700">Email: <a href="mailto:manager-support@electra.com" className="text-blue-600 hover:text-blue-700">manager-support@electra.com</a></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-gray-700">Hotline: <span className="font-medium">1900 2222</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

