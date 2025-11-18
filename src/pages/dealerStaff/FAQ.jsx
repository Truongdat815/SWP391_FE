import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqCategories = [
    {
      category: "Vấn đề về đơn hàng",
      icon: "📦",
      items: [
        {
          id: 1,
          question: "Không thể tạo đơn hàng mới",
          answer: "Kiểm tra các bước sau:\n1. Đảm bảo đã chọn khách hàng và mẫu xe\n2. Kiểm tra kết nối mạng\n3. Làm mới trang (F5) và thử lại\n4. Nếu vẫn lỗi, liên hệ quản lý hoặc IT support",
          solutions: [
            "Kiểm tra thông tin khách hàng đã đầy đủ chưa",
            "Xác nhận mẫu xe còn trong kho",
            "Xóa cache trình duyệt và thử lại",
            "Thử trình duyệt khác (Chrome, Firefox, Edge)",
            "Liên hệ quản lý nếu vấn đề vẫn tiếp tục"
          ]
        },
        {
          id: 2,
          question: "Không thấy đơn hàng mới trong danh sách",
          answer: "Có thể do:\n1. Bộ lọc trạng thái đang ẩn đơn hàng\n2. Đơn hàng chưa được lưu thành công\n3. Vấn đề về quyền truy cập",
          solutions: [
            "Kiểm tra và xóa các bộ lọc đang áp dụng",
            "Làm mới trang (F5)",
            "Kiểm tra quyền truy cập của tài khoản",
            "Đăng xuất và đăng nhập lại",
            "Liên hệ IT support nếu vẫn không thấy"
          ]
        },
        {
          id: 3,
          question: "Không thể chỉnh sửa đơn hàng đã tạo",
          answer: "Đơn hàng có thể đã được xác nhận hoặc đang trong quá trình xử lý. Chỉ có thể chỉnh sửa đơn hàng ở trạng thái 'Draft' hoặc 'Pending'.",
          solutions: [
            "Kiểm tra trạng thái đơn hàng",
            "Nếu đã xác nhận, liên hệ quản lý để hủy và tạo lại",
            "Nếu cần thay đổi nhỏ, có thể tạo đơn hàng mới và ghi chú",
            "Liên hệ quản lý để được hỗ trợ"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về khách hàng",
      icon: "👥",
      items: [
        {
          id: 4,
          question: "Không thể thêm khách hàng mới",
          answer: "Kiểm tra:\n1. Thông tin bắt buộc đã điền đầy đủ\n2. Email và số điện thoại không trùng với khách hàng khác\n3. Định dạng email và số điện thoại đúng",
          solutions: [
            "Kiểm tra các trường bắt buộc (đánh dấu *)",
            "Xác nhận email và số điện thoại chưa tồn tại",
            "Kiểm tra định dạng email (có @ và domain)",
            "Kiểm tra số điện thoại (10-11 chữ số)",
            "Làm mới trang và thử lại"
          ]
        },
        {
          id: 5,
          question: "Không tìm thấy khách hàng trong danh sách",
          answer: "Có thể do:\n1. Từ khóa tìm kiếm không chính xác\n2. Khách hàng thuộc cửa hàng khác\n3. Bộ lọc đang ẩn kết quả",
          solutions: [
            "Thử tìm kiếm với từ khóa khác (tên, email, số điện thoại)",
            "Xóa các bộ lọc đang áp dụng",
            "Kiểm tra xem khách hàng có thuộc cửa hàng của bạn không",
            "Liên hệ quản lý nếu cần truy cập khách hàng của cửa hàng khác"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về lịch lái thử",
      icon: "📅",
      items: [
        {
          id: 6,
          question: "Không thể đặt lịch lái thử",
          answer: "Kiểm tra:\n1. Thời gian đã chọn có trống không\n2. Xe có sẵn trong kho không\n3. Khách hàng đã được chọn",
          solutions: [
            "Kiểm tra lịch có sẵn trong mục 'Lịch lái thử'",
            "Xác nhận xe còn trong kho và sẵn sàng",
            "Chọn thời gian khác nếu slot đã đầy",
            "Xóa cache trình duyệt và thử lại",
            "Liên hệ quản lý để được hỗ trợ đặt lịch"
          ]
        },
        {
          id: 7,
          question: "Lịch lái thử bị trùng lặp",
          answer: "Có thể do nhiều người cùng đặt hoặc hệ thống chưa cập nhật kịp.",
          solutions: [
            "Kiểm tra lại lịch trước khi xác nhận",
            "Liên hệ quản lý để điều chỉnh lịch",
            "Thông báo cho khách hàng về sự thay đổi",
            "Đặt lại lịch mới cho khách hàng"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về thanh toán",
      icon: "💳",
      items: [
        {
          id: 8,
          question: "Không thể cập nhật trạng thái thanh toán",
          answer: "Kiểm tra quyền hạn và trạng thái đơn hàng.",
          solutions: [
            "Xác nhận bạn có quyền cập nhật thanh toán",
            "Kiểm tra đơn hàng đã được xác nhận chưa",
            "Làm mới trang và thử lại",
            "Liên hệ quản lý nếu cần hỗ trợ"
          ]
        },
        {
          id: 9,
          question: "Thông tin thanh toán không chính xác",
          answer: "Cần kiểm tra lại thông tin với khách hàng và cập nhật.",
          solutions: [
            "Xác nhận lại thông tin với khách hàng",
            "Kiểm tra biên lai hoặc chứng từ thanh toán",
            "Cập nhật thông tin trong hệ thống",
            "Thông báo cho quản lý nếu có sai sót lớn"
          ]
        }
      ]
    },
    {
      category: "Vấn đề về hệ thống",
      icon: "⚙️",
      items: [
        {
          id: 10,
          question: "Trang web chạy chậm hoặc không phản hồi",
          answer: "Có thể do kết nối mạng hoặc tải hệ thống.",
          solutions: [
            "Kiểm tra kết nối mạng internet",
            "Đóng các tab không cần thiết",
            "Làm mới trang (F5)",
            "Xóa cache và cookies của trình duyệt",
            "Thử trình duyệt khác",
            "Liên hệ IT support nếu vấn đề tiếp tục"
          ]
        },
        {
          id: 11,
          question: "Không thể đăng nhập vào hệ thống",
          answer: "Kiểm tra thông tin đăng nhập và kết nối.",
          solutions: [
            "Kiểm tra tên đăng nhập và mật khẩu",
            "Xác nhận Caps Lock không bật",
            "Thử quên mật khẩu và đặt lại",
            "Kiểm tra kết nối mạng",
            "Xóa cache trình duyệt",
            "Liên hệ IT support để được hỗ trợ"
          ]
        },
        {
          id: 12,
          question: "Dữ liệu không được lưu",
          answer: "Có thể do mất kết nối hoặc lỗi hệ thống.",
          solutions: [
            "Kiểm tra kết nối mạng",
            "Không đóng trang khi đang lưu",
            "Làm mới trang và thử lại",
            "Kiểm tra thông báo lỗi từ hệ thống",
            "Liên hệ IT support nếu mất dữ liệu quan trọng"
          ]
        }
      ]
    }
  ];

  // Filter FAQs based on search query
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
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Tìm giải pháp cho các vấn đề thường gặp</p>
          </div>
          <button
            onClick={() => navigate('/dealer-staff/help')}
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
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      {filteredFAQs.length > 0 ? (
        <div className="space-y-4 sm:space-y-5">
          {filteredFAQs.map((category) => (
            <div key={category.category} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 sm:px-5 py-3 sm:py-4 border-b border-emerald-200">
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
                              <span className="text-emerald-600">✓</span>
                              Các bước xử lý:
                            </h4>
                            <ul className="space-y-2">
                              {item.solutions.map((solution, index) => (
                                <li key={index} className="flex items-start gap-2 sm:gap-3">
                                  <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
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
            <span className="text-gray-700">Email: <a href="mailto:staff-support@electra.com" className="text-blue-600 hover:text-blue-700">staff-support@electra.com</a></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-gray-700">Hotline: <span className="font-medium">1900 1111</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

