import React, { useState } from 'react';

const AdminHelp = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      id: 1,
      question: "Làm thế nào để quản lý quyền hạn người dùng?",
      answer: "Vào mục 'Quản lý người dùng' → Chọn người dùng → Chỉnh sửa quyền hạn → Lưu thay đổi. Bạn có thể phân quyền theo vai trò: Admin, EVM Staff, Dealer Manager, Dealer Staff."
    },
    {
      id: 2,
      question: "Cách theo dõi hoạt động hệ thống?",
      answer: "Sử dụng mục 'Giám sát & Logs' để xem: lịch sử đăng nhập, hoạt động người dùng, lỗi hệ thống, và các cảnh báo bảo mật."
    },
    {
      id: 3,
      question: "Làm sao để cấu hình bảo mật hệ thống?",
      answer: "Vào 'Cấu hình hệ thống' → 'Cấu hình bảo mật' để thiết lập: độ mạnh mật khẩu, thời gian phiên đăng nhập, và các chính sách bảo mật khác."
    },
    {
      id: 4,
      question: "Cách thêm đại lý mới vào hệ thống?",
      answer: "Vào 'Quản lý cửa hàng' → 'Thêm đại lý mới' → Điền thông tin đại lý → Tạo tài khoản quản lý → Gửi thông tin đăng nhập."
    },
    {
      id: 5,
      question: "Làm thế nào để xuất báo cáo hệ thống?",
      answer: "Các báo cáo có thể xuất từ nhiều mục khác nhau. Sử dụng nút 'Xuất' trong từng trang báo cáo để tải về file PDF hoặc Excel."
    }
  ];

  const troubleshooting = [
    {
      issue: "Không thể đăng nhập vào hệ thống",
      solutions: [
        "Kiểm tra kết nối mạng",
        "Xóa cache trình duyệt",
        "Kiểm tra thông tin đăng nhập",
        "Liên hệ IT support"
      ]
    },
    {
      issue: "Hệ thống chạy chậm",
      solutions: [
        "Kiểm tra kết nối mạng",
        "Đóng các tab không cần thiết",
        "Làm mới trang web",
        "Khởi động lại trình duyệt"
      ]
    },
    {
      issue: "Lỗi hiển thị dữ liệu",
      solutions: [
        "Làm mới trang web (F5)",
        "Kiểm tra kết nối database",
        "Kiểm tra quyền truy cập",
        "Liên hệ admin"
      ]
    }
  ];

  const filteredFaq = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      )}
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trợ giúp quản trị</h1>
        <p className="text-gray-600 mt-1">Hướng dẫn và hỗ trợ cho quản trị viên hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  activeTab === 'faq'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Câu hỏi thường gặp
              </button>
              <button
                onClick={() => setActiveTab('troubleshooting')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  activeTab === 'troubleshooting'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Khắc phục sự cố
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  activeTab === 'docs'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tài liệu
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span>
                          <span className="text-sm text-gray-600">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === 'docs' && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Hướng dẫn sử dụng Admin</h4>
                      <p className="text-sm text-gray-500">Hướng dẫn chi tiết về các tính năng quản trị</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Bảo mật hệ thống</h4>
                      <p className="text-sm text-gray-500">Hướng dẫn bảo mật và bảo vệ dữ liệu</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Báo cáo & Phân tích</h4>
                      <p className="text-sm text-gray-500">Cách sử dụng các tính năng báo cáo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Các bước khắc phục nhanh */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Các bước khắc phục nhanh</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span> 
                Kiểm tra kết nối mạng và làm mới trang (F5)
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span> 
                Đăng xuất và đăng nhập lại tài khoản
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span> 
                Xóa cache trình duyệt nếu gặp lỗi hiển thị
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500"></span> 
                Kiểm tra quyền truy cập và vai trò người dùng
              </li>
            </ul>
          </section>
        </div>

        <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Liên hệ hỗ trợ</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">admin-support@electra.com</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm text-gray-700">Hotline: 1900 0000</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">Giờ hỗ trợ: 8:00 - 17:00</span>
            </div>
          </div>
          
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
            Gửi yêu cầu hỗ trợ
          </button>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Trạng thái hệ thống</h4>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Hệ thống hoạt động bình thường</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminHelp;
