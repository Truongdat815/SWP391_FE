import React, { useState } from 'react';

const EVMStaffHelp = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      id: 1,
      question: "Làm thế nào để quản lý tồn kho xe?",
      answer: "Vào mục 'Quản lý tồn kho' → Xem danh sách xe → Cập nhật số lượng → Ghi chú thay đổi → Lưu. Bạn có thể lọc theo mẫu xe, trạng thái, và vị trí kho."
    },
    {
      id: 2,
      question: "Cách thêm sản phẩm mới vào hệ thống?",
      answer: "Vào 'Quản lý sản phẩm' → 'Thêm sản phẩm mới' → Điền thông tin xe → Upload hình ảnh → Thiết lập giá sỉ → Lưu và kích hoạt."
    },
    {
      id: 3,
      question: "Làm sao để quản lý đại lý?",
      answer: "Sử dụng 'Quản lý đại lý' để: thêm đại lý mới, cập nhật thông tin, quản lý hợp đồng, theo dõi hiệu suất bán hàng."
    },
    {
      id: 4,
      question: "Cách thiết lập giá sỉ cho đại lý?",
      answer: "Vào 'Quản lý giá sỉ' → Chọn đại lý → Chọn mẫu xe → Thiết lập giá sỉ → Áp dụng từ ngày → Lưu thay đổi."
    },
    {
      id: 5,
      question: "Làm thế nào để xử lý đơn hàng từ đại lý?",
      answer: "Vào 'Quản lý hợp đồng' → Xem đơn hàng mới → Kiểm tra tồn kho → Phê duyệt/từ chối → Cập nhật trạng thái → Thông báo cho đại lý."
    },
    {
      id: 6,
      question: "Cách tạo báo cáo doanh số?",
      answer: "Sử dụng 'Báo cáo & phân tích' để tạo báo cáo: theo đại lý, theo mẫu xe, theo thời gian. Có thể xuất PDF hoặc Excel."
    }
  ];

  const troubleshooting = [
    {
      issue: "Không thể cập nhật tồn kho",
      solutions: [
        "Kiểm tra quyền hạn cập nhật",
        "Kiểm tra thông tin xe có chính xác",
        "Làm mới trang và thử lại",
        "Liên hệ admin nếu vẫn lỗi"
      ]
    },
    {
      issue: "Đơn hàng không hiển thị",
      solutions: [
        "Kiểm tra bộ lọc trạng thái",
        "Kiểm tra quyền truy cập đại lý",
        "Làm mới trang web",
        "Kiểm tra kết nối database"
      ]
    },
    {
      issue: "Lỗi khi thiết lập giá sỉ",
      solutions: [
        "Kiểm tra giá có hợp lệ không",
        "Kiểm tra ngày áp dụng",
        "Xóa cache trình duyệt",
        "Thử trình duyệt khác"
      ]
    },
    {
      issue: "Không thể tạo báo cáo",
      solutions: [
        "Kiểm tra khoảng thời gian",
        "Kiểm tra quyền truy cập dữ liệu",
        "Làm mới trang",
        "Liên hệ IT support"
      ]
    },
    {
      issue: "Cảnh báo tồn kho không hoạt động",
      solutions: [
        "Kiểm tra cài đặt cảnh báo",
        "Kiểm tra ngưỡng tồn kho",
        "Kiểm tra thông báo email",
        "Liên hệ admin"
      ]
    }
  ];

  const filteredFaq = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
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
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-8 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Trợ giúp EVM</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">Hướng dẫn và hỗ trợ cho nhân viên EVM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quản lý tồn kho</h4>
                      <p className="text-sm text-gray-500">Hướng dẫn chi tiết quản lý kho xe</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quản lý sản phẩm</h4>
                      <p className="text-sm text-gray-500">Cách thêm và cập nhật thông tin xe</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quản lý đại lý</h4>
                      <p className="text-sm text-gray-500">Hướng dẫn quản lý thông tin đại lý</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quản lý hợp đồng</h4>
                      <p className="text-sm text-gray-500">Xử lý đơn hàng và hợp đồng</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Báo cáo & phân tích</h4>
                      <p className="text-sm text-gray-500">Tạo báo cáo và phân tích dữ liệu</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Các bước khắc phục nhanh */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Các bước khắc phục nhanh</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Kiểm tra kết nối mạng và làm mới trang (F5)
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Kiểm tra quyền hạn và vai trò người dùng
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Kiểm tra dữ liệu tồn kho và đơn hàng
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> 
                Liên hệ admin nếu gặp vấn đề nghiêm trọng
              </li>
            </ul>
          </section>
        </div>

        <aside className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Liên hệ hỗ trợ</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">evm-support@electra.com</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-gray-700">Hotline: 1900 2222</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">Giờ hỗ trợ: 8:00 - 17:00</span>
            </div>
          </div>
          
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition bg-white text-gray-900">
            Gửi yêu cầu hỗ trợ
          </button>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Trạng thái hệ thống</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kho xe:</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-emerald-600">Hoạt động bình thường</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-emerald-600">Kết nối ổn định</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API:</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-emerald-600">Phản hồi nhanh</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Thống kê hiệu suất</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tồn kho:</span>
                <span className="font-medium text-emerald-600">1,247 xe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã phân phối:</span>
                <span className="font-medium text-emerald-600">892 xe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đại lý:</span>
                <span className="font-medium text-emerald-600">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đánh giá:</span>
                <span className="font-medium text-emerald-600">4.9⭐</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EVMStaffHelp;
