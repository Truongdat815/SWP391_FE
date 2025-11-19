import React, { useState } from 'react';

const DealerStaffHelp = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      id: 1,
      question: "Làm thế nào để tạo báo giá cho khách hàng?",
      answer: "Vào mục 'Tạo báo giá' → Chọn mẫu xe → Nhập thông tin khách hàng → Chọn phụ kiện → Xác nhận và gửi báo giá cho khách hàng."
    },
    {
      id: 2,
      question: "Cách theo dõi trạng thái đơn hàng?",
      answer: "Sử dụng mục 'Xem đơn hàng' để theo dõi: đơn hàng mới, đang xử lý, đã giao hàng, và các trạng thái khác."
    },
    {
      id: 3,
      question: "Làm sao để đặt lịch lái thử cho khách hàng?",
      answer: "Vào 'Lịch hẹn lái thử' → 'Đặt lịch mới' → Chọn thời gian → Chọn xe → Nhập thông tin khách hàng → Xác nhận."
    },
    {
      id: 4,
      question: "Cách quản lý thanh toán của khách hàng?",
      answer: "Sử dụng 'Quản lý thanh toán' để: xem lịch sử thanh toán, cập nhật trạng thái, gửi nhắc nhở thanh toán."
    },
    {
      id: 5,
      question: "Làm thế nào để đặt xe từ nhà sản xuất?",
      answer: "Vào 'Đặt xe từ hãng' → Chọn mẫu xe và số lượng → Điền thông tin đặt hàng → Gửi yêu cầu cho EVM Staff."
    },
    {
      id: 6,
      question: "Cách xử lý phản hồi và khiếu nại?",
      answer: "Sử dụng 'Phản hồi & khiếu nại' để: xem danh sách phản hồi, phân loại, trả lời khách hàng, và báo cáo lên cấp trên."
    }
  ];

  const troubleshooting = [
    {
      issue: "Không thể tạo báo giá",
      solutions: [
        "Kiểm tra thông tin khách hàng đã đầy đủ",
        "Kiểm tra giá xe và phụ kiện",
        "Làm mới trang và thử lại",
        "Liên hệ quản lý nếu vẫn lỗi"
      ]
    },
    {
      issue: "Không thấy đơn hàng mới",
      solutions: [
        "Kiểm tra bộ lọc trạng thái",
        "Làm mới trang web",
        "Kiểm tra quyền truy cập",
        "Liên hệ IT support"
      ]
    },
    {
      issue: "Lỗi khi đặt lịch lái thử",
      solutions: [
        "Kiểm tra thời gian có trống không",
        "Kiểm tra xe có sẵn không",
        "Xóa cache trình duyệt",
        "Thử trình duyệt khác"
      ]
    },
    {
      issue: "Không thể cập nhật thanh toán",
      solutions: [
        "Kiểm tra quyền hạn",
        "Kiểm tra thông tin đơn hàng",
        "Làm mới trang",
        "Liên hệ quản lý"
      ]
    }
  ];

  const filteredFaq = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-2 py-3 sm:py-4 md:py-5 space-y-3 sm:space-y-4 md:space-y-5">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-3 sm:mb-4 flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 gap-1.5 sm:gap-2"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Quay lại</span>
        </button>
      )}
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Trợ giúp bán hàng</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">Hướng dẫn và hỗ trợ cho nhân viên bán hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-1 bg-gray-100 rounded-lg p-1 mb-3 sm:mb-4">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'faq'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Câu hỏi thường gặp
              </button>
              <button
                onClick={() => setActiveTab('troubleshooting')}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'troubleshooting'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Khắc phục sự cố
              </button>
              <button
                onClick={() => setActiveTab('guides')}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === 'guides'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hướng dẫn
              </button>
            </div>

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
                  />
                </div>
                <div className="space-y-4">
                  {filteredFaq.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Troubleshooting Tab */}
            {activeTab === 'troubleshooting' && (
              <div className="space-y-4">
                {troubleshooting.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{item.issue}</h3>
                    <ul className="space-y-2">
                      {item.solutions.map((solution, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span className="text-sm text-gray-600">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Guides Tab */}
            {activeTab === 'guides' && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Hướng dẫn tạo báo giá</h4>
                      <p className="text-sm text-gray-500">Quy trình chi tiết tạo báo giá cho khách hàng</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quản lý lịch hẹn lái thử</h4>
                      <p className="text-sm text-gray-500">Cách đặt và quản lý lịch hẹn với khách hàng</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Theo dõi thanh toán</h4>
                      <p className="text-sm text-gray-500">Hướng dẫn quản lý và theo dõi thanh toán</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Xử lý khiếu nại</h4>
                      <p className="text-sm text-gray-500">Quy trình xử lý phản hồi và khiếu nại khách hàng</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Các bước khắc phục nhanh */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Các bước khắc phục nhanh</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Kiểm tra kết nối mạng và làm mới trang (F5)
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Đăng xuất và đăng nhập lại tài khoản
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Kiểm tra thông tin khách hàng và đơn hàng
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Liên hệ quản lý trực tiếp nếu gặp vấn đề
              </li>
            </ul>
          </section>
        </div>

        <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Liên hệ hỗ trợ</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">staff-support@electra.com</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-gray-700">Hotline: 1900 1111</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">Giờ hỗ trợ: 8:00 - 17:00</span>
            </div>
          </div>
          
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition bg-white text-gray-900">
            Gửi yêu cầu hỗ trợ
          </button>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Quản lý trực tiếp</h4>
            <div className="text-sm text-gray-600">
              <p><strong>Nguyễn Văn Manager</strong></p>
              <p>manager@electra.com</p>
              <p>0901 234 567</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Thành tích tháng</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doanh số:</span>
                <span className="font-medium text-emerald-600">2.1M VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đơn hàng:</span>
                <span className="font-medium text-emerald-600">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đánh giá:</span>
                <span className="font-medium text-emerald-600">4.8⭐</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DealerStaffHelp;
