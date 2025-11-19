import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị trang hướng dẫn sử dụng cho Dealer Manager
 * 
 * Component này cung cấp các hướng dẫn chi tiết về các chức năng quản lý
 * bao gồm: quản lý kho, quản lý đơn hàng, quản lý nhân viên, khuyến mãi,
 * báo cáo doanh số và các chức năng khác dành cho quản lý đại lý.
 * 
 * @component
 * @returns {JSX.Element} Component hiển thị danh sách hướng dẫn sử dụng
 * 
 * @example
 * <UserGuide />
 */
const UserGuide = () => {
  /**
   * Hook React Router để điều hướng giữa các trang
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Mảng chứa danh sách các hướng dẫn sử dụng
   * Mỗi hướng dẫn bao gồm: id, title, icon và các bước thực hiện
   * 
   * @type {Array<Object>}
   * @property {number} id - Mã định danh duy nhất của hướng dẫn
   * @property {string} title - Tiêu đề của hướng dẫn
   * @property {string} icon - Icon emoji đại diện cho hướng dẫn
   * @property {Array<string>} steps - Mảng các bước hướng dẫn chi tiết
   */
  const guides = [
    {
      id: 1,
      title: "Quản lý tồn kho",
      icon: "📦",
      steps: [
        "Vào mục 'Quản lý kho' để xem tổng quan tồn kho",
        "Xem danh sách xe theo mẫu, màu sắc và số lượng",
        "Cập nhật giá bán: Chọn xe → Nhấn 'Chỉnh sửa giá' → Nhập giá mới → Lưu",
        "Theo dõi số lượng tồn kho và cảnh báo khi sắp hết hàng",
        "Xem lịch sử giao dịch kho: Nhập kho, Xuất kho, Điều chuyển",
        "Tạo yêu cầu nhập kho từ EVM: Chọn 'Đặt hàng từ hãng' → Điền thông tin → Gửi yêu cầu",
        "Xác nhận giao hàng: Khi nhận được xe, xác nhận giao hàng và cập nhật số lượng"
      ]
    },
    {
      id: 2,
      title: "Quản lý đơn hàng",
      icon: "📋",
      steps: [
        "Vào mục 'Quản lý đơn hàng' để xem tất cả đơn hàng",
        "Lọc đơn hàng theo: Trạng thái, Nhân viên, Khách hàng, Thời gian",
        "Xem chi tiết đơn hàng: Nhấn vào đơn hàng để xem thông tin đầy đủ",
        "Phê duyệt đơn hàng: Xem đơn hàng → Kiểm tra thông tin → Phê duyệt hoặc từ chối",
        "Theo dõi trạng thái đơn hàng: Pending, Confirmed, Processing, Completed, Cancelled",
        "Xuất báo cáo đơn hàng: Chọn khoảng thời gian → Xuất Excel/PDF",
        "Xử lý đơn hàng có vấn đề: Liên hệ nhân viên hoặc khách hàng để giải quyết"
      ]
    },
    {
      id: 3,
      title: "Quản lý nhân viên",
      icon: "👥",
      steps: [
        "Vào mục 'Quản lý nhân viên' để xem danh sách nhân viên",
        "Thêm nhân viên mới: Nhấn 'Thêm nhân viên' → Điền thông tin → Phân quyền → Lưu",
        "Chỉnh sửa thông tin nhân viên: Chọn nhân viên → 'Chỉnh sửa' → Cập nhật → Lưu",
        "Phân quyền cho nhân viên: Chọn nhân viên → 'Phân quyền' → Chọn quyền → Lưu",
        "Vô hiệu hóa/Kích hoạt tài khoản: Chọn nhân viên → Thay đổi trạng thái",
        "Xem hiệu suất làm việc: Xem số đơn hàng, doanh số của từng nhân viên",
        "Theo dõi lịch sử hoạt động: Xem các thao tác và thay đổi của nhân viên"
      ]
    },
    {
      id: 4,
      title: "Quản lý khuyến mãi",
      icon: "🎁",
      steps: [
        "Vào mục 'Quản lý khuyến mãi' để xem danh sách chương trình",
        "Tạo khuyến mãi mới: Nhấn 'Tạo khuyến mãi' → Điền thông tin",
        "Thiết lập điều kiện: Chọn loại khuyến mãi (Giảm giá %, Giảm giá cố định, Tặng quà)",
        "Chọn sản phẩm áp dụng: Chọn mẫu xe hoặc áp dụng cho tất cả",
        "Thiết lập thời gian: Chọn ngày bắt đầu và kết thúc",
        "Kích hoạt/Tạm dừng khuyến mãi: Thay đổi trạng thái khi cần",
        "Theo dõi hiệu quả: Xem số đơn hàng và doanh số từ khuyến mãi",
        "Chỉnh sửa hoặc xóa khuyến mãi: Chọn khuyến mãi → 'Chỉnh sửa' hoặc 'Xóa'"
      ]
    },
    {
      id: 5,
      title: "Báo cáo doanh số",
      icon: "📊",
      steps: [
        "Vào mục 'Báo cáo doanh số' để xem các báo cáo",
        "Chọn loại báo cáo: Theo thời gian, Theo nhân viên, Theo sản phẩm, Tổng hợp",
        "Chọn khoảng thời gian: Ngày, Tuần, Tháng, Quý, Năm hoặc tùy chỉnh",
        "Xem biểu đồ và thống kê: Doanh số, Số đơn hàng, Lợi nhuận",
        "Lọc theo nhân viên: Xem hiệu suất của từng nhân viên",
        "Lọc theo sản phẩm: Xem sản phẩm bán chạy nhất",
        "Xuất báo cáo: Chọn định dạng (Excel, PDF) → Tải xuống",
        "So sánh kỳ: So sánh doanh số giữa các kỳ để đánh giá tăng trưởng"
      ]
    },
    {
      id: 6,
      title: "Theo dõi hiệu suất cửa hàng",
      icon: "📈",
      steps: [
        "Vào Dashboard để xem tổng quan hiệu suất",
        "Xem các chỉ số chính: Doanh số, Đơn hàng, Tồn kho, Nhân viên",
        "Theo dõi biểu đồ xu hướng: Doanh số theo thời gian, Đơn hàng theo trạng thái",
        "Xem thống kê nhân viên: Top nhân viên bán hàng, Hiệu suất từng nhân viên",
        "Theo dõi tồn kho: Số lượng tồn kho, Cảnh báo hết hàng, Giá trị tồn kho",
        "Xem phản hồi khách hàng: Đánh giá, Góp ý, Khiếu nại",
        "Phân tích xu hướng: Xác định sản phẩm bán chạy, Thời điểm bán tốt nhất"
      ]
    },
    {
      id: 7,
      title: "Quản lý giá sỉ và giá bán",
      icon: "💰",
      steps: [
        "Vào mục 'Quản lý kho' → Chọn tab 'Giá cả'",
        "Xem danh sách giá: Giá sỉ từ EVM, Giá bán đề xuất, Giá bán hiện tại",
        "Cập nhật giá bán: Chọn sản phẩm → 'Chỉnh sửa giá' → Nhập giá mới",
        "Thiết lập chính sách giá: Áp dụng giá cho từng mẫu xe hoặc tất cả",
        "Xem lịch sử thay đổi giá: Theo dõi các thay đổi giá theo thời gian",
        "Xuất bảng giá: Tạo bảng giá để gửi cho khách hàng hoặc in",
        "So sánh giá: So sánh giá với các đại lý khác (nếu có quyền)"
      ]
    },
    {
      id: 8,
      title: "Xử lý yêu cầu và khiếu nại",
      icon: "🔧",
      steps: [
        "Vào Dashboard để xem các yêu cầu và khiếu nại",
        "Xem phản hồi khách hàng: Đánh giá, Góp ý, Khiếu nại",
        "Phân loại khiếu nại: Theo mức độ nghiêm trọng, Loại vấn đề",
        "Phân công xử lý: Giao cho nhân viên phù hợp xử lý",
        "Theo dõi tiến độ: Xem trạng thái xử lý của từng khiếu nại",
        "Phản hồi khách hàng: Trả lời và giải quyết vấn đề",
        "Báo cáo lên EVM: Nếu vấn đề nghiêm trọng, báo cáo lên cấp trên",
        "Đánh giá hiệu quả: Xem tỷ lệ giải quyết và thời gian xử lý"
      ]
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Hướng dẫn chi tiết các chức năng dành cho Dealer Manager</p>
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
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
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
                        <div className="h-5 w-5 sm:h-6 sm:w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
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
          Mẹo quản lý hiệu quả
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Thường xuyên kiểm tra tồn kho để tránh hết hàng và đảm bảo đủ hàng cho khách hàng</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Theo dõi hiệu suất nhân viên thường xuyên để đánh giá và hỗ trợ kịp thời</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Sử dụng báo cáo doanh số để phân tích xu hướng và đưa ra quyết định kinh doanh</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Tạo khuyến mãi hợp lý để tăng doanh số mà vẫn đảm bảo lợi nhuận</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Xử lý khiếu nại nhanh chóng và chuyên nghiệp để duy trì uy tín cửa hàng</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserGuide;

