import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserGuide = () => {
  const navigate = useNavigate();

  const guides = [
    {
      id: 1,
      title: "Tạo đơn hàng mới",
      icon: "📝",
      steps: [
        "Vào mục 'Quản lý đơn hàng' → Chọn 'Tạo đơn hàng'",
        "Chọn khách hàng từ danh sách hoặc thêm khách hàng mới",
        "Chọn mẫu xe và cấu hình mong muốn",
        "Thêm phụ kiện và dịch vụ (nếu có)",
        "Xem tổng quan đơn hàng và xác nhận",
        "Gửi đơn hàng để được phê duyệt"
      ]
    },
    {
      id: 2,
      title: "Quản lý khách hàng",
      icon: "👥",
      steps: [
        "Vào mục 'Quản lý khách hàng' để xem danh sách",
        "Sử dụng thanh tìm kiếm để tìm khách hàng theo tên, email, số điện thoại",
        "Thêm khách hàng mới: Nhấn 'Thêm khách hàng' → Điền đầy đủ thông tin",
        "Chỉnh sửa thông tin: Nhấn biểu tượng chỉnh sửa trên từng khách hàng",
        "Xem chi tiết: Nhấn biểu tượng mắt để xem thông tin đầy đủ",
        "Xem lịch sử đơn hàng: Nhấn biểu tượng tài liệu để xem các đơn hàng của khách hàng"
      ]
    },
    {
      id: 3,
      title: "Đặt lịch lái thử",
      icon: "📅",
      steps: [
        "Vào mục 'Lịch lái thử' → Chọn 'Đặt lịch mới'",
        "Chọn khách hàng từ danh sách",
        "Chọn mẫu xe muốn lái thử",
        "Chọn ngày và giờ phù hợp",
        "Xác nhận thông tin và gửi lịch hẹn",
        "Nhắc nhở khách hàng trước 1 ngày"
      ]
    },
    {
      id: 4,
      title: "Tạo báo giá",
      icon: "💰",
      steps: [
        "Vào mục 'Quản lý báo giá' → 'Tạo báo giá mới'",
        "Chọn khách hàng hoặc nhập thông tin khách hàng mới",
        "Chọn mẫu xe và các tùy chọn",
        "Thêm phụ kiện, bảo hiểm, và các dịch vụ khác",
        "Xem tổng giá và điều chỉnh nếu cần",
        "Xuất báo giá PDF và gửi cho khách hàng"
      ]
    },
    {
      id: 5,
      title: "Quản lý thanh toán",
      icon: "💳",
      steps: [
        "Vào mục 'Quản lý thanh toán' để xem danh sách",
        "Lọc theo trạng thái: Đã thanh toán, Chờ thanh toán, Quá hạn",
        "Cập nhật trạng thái thanh toán khi khách hàng đã thanh toán",
        "Gửi nhắc nhở thanh toán cho các đơn hàng quá hạn",
        "Xem lịch sử thanh toán của từng khách hàng"
      ]
    },
    {
      id: 6,
      title: "Xử lý phản hồi khách hàng",
      icon: "💬",
      steps: [
        "Vào mục 'Phản hồi khách hàng' để xem danh sách",
        "Phân loại phản hồi: Khen ngợi, Góp ý, Khiếu nại",
        "Trả lời phản hồi trong vòng 24 giờ",
        "Nếu là khiếu nại nghiêm trọng, báo cáo lên quản lý",
        "Cập nhật trạng thái: Đang xử lý, Đã xử lý, Đã đóng"
      ]
    },
    {
      id: 7,
      title: "Đặt xe từ nhà sản xuất",
      icon: "🚗",
      steps: [
        "Vào mục 'Đặt xe từ hãng'",
        "Chọn mẫu xe và số lượng cần đặt",
        "Điền thông tin đặt hàng: Ngày giao dự kiến, Ghi chú",
        "Xem tổng giá và xác nhận",
        "Gửi yêu cầu cho EVM Staff để xử lý",
        "Theo dõi trạng thái đơn hàng trong mục 'Quản lý đơn hàng'"
      ]
    },
    {
      id: 8,
      title: "So sánh các mẫu xe",
      icon: "⚖️",
      steps: [
        "Vào mục 'So sánh xe'",
        "Chọn tối đa 3 mẫu xe để so sánh",
        "Xem so sánh về: Giá, Quãng đường, Công suất, Tính năng",
        "Xuất bảng so sánh để tư vấn cho khách hàng",
        "Sử dụng thông tin so sánh để đưa ra khuyến nghị phù hợp"
      ]
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Hướng dẫn chi tiết các chức năng dành cho Dealer Staff</p>
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
      </div>

      {/* Guides List */}
      <div className="space-y-4 sm:space-y-5">
        {guides.map((guide, index) => (
          <div
            key={guide.id}
            className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
                  {guide.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {index + 1}. {guide.title}
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {guide.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-5 w-5 sm:h-6 sm:w-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                          {stepIndex + 1}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base text-gray-700 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">💡</span>
          Mẹo hữu ích
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Luôn cập nhật thông tin khách hàng đầy đủ và chính xác để tránh sai sót</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Kiểm tra kỹ thông tin đơn hàng trước khi gửi để tránh phải chỉnh sửa sau</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Phản hồi khách hàng nhanh chóng để tăng sự hài lòng và uy tín</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Sử dụng tính năng so sánh xe để tư vấn khách hàng hiệu quả hơn</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserGuide;

