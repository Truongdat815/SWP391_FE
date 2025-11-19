import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị trang hướng dẫn sử dụng cho Admin
 * 
 * Component này cung cấp các hướng dẫn chi tiết về các chức năng quản trị
 * bao gồm: quản lý cửa hàng, quản lý người dùng, cấu hình hệ thống,
 * bảo mật, báo cáo và các chức năng khác dành cho quản trị viên.
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
      title: "Quản lý cửa hàng (Đại lý)",
      icon: "🏪",
      steps: [
        "Vào mục 'Quản lý cửa hàng' để xem danh sách tất cả đại lý",
        "Thêm đại lý mới: Nhấn 'Thêm đại lý' → Điền thông tin (Tên, Địa chỉ, Số điện thoại, Email) → Lưu",
        "Chỉnh sửa thông tin đại lý: Chọn đại lý → Nhấn 'Chỉnh sửa' → Cập nhật thông tin → Lưu",
        "Xem chi tiết đại lý: Nhấn vào đại lý để xem thông tin đầy đủ, lịch sử giao dịch, nhân viên",
        "Tạo tài khoản quản lý: Chọn đại lý → 'Tạo tài khoản' → Điền thông tin đăng nhập → Gửi thông tin cho quản lý",
        "Quản lý trạng thái: Kích hoạt/Tạm ngưng đại lý khi cần",
        "Xem báo cáo đại lý: Xem doanh số, số đơn hàng, hiệu suất của từng đại lý",
        "Xóa đại lý: Chọn đại lý → 'Xóa' → Xác nhận (Lưu ý: Chỉ xóa được khi không có dữ liệu liên quan)"
      ]
    },
    {
      id: 2,
      title: "Quản lý người dùng",
      icon: "👥",
      steps: [
        "Vào mục 'Quản lý người dùng' để xem danh sách tất cả người dùng trong hệ thống",
        "Lọc người dùng: Theo vai trò (Admin, EVM Staff, Dealer Manager, Dealer Staff), Theo trạng thái, Theo đại lý",
        "Thêm người dùng mới: Nhấn 'Thêm người dùng' → Điền thông tin → Chọn vai trò → Gán đại lý (nếu cần) → Lưu",
        "Chỉnh sửa thông tin người dùng: Chọn người dùng → 'Chỉnh sửa' → Cập nhật thông tin → Lưu",
        "Phân quyền cho người dùng: Chọn người dùng → 'Phân quyền' → Chọn quyền hạn → Lưu",
        "Kích hoạt/Vô hiệu hóa tài khoản: Chọn người dùng → Thay đổi trạng thái → Xác nhận",
        "Đặt lại mật khẩu: Chọn người dùng → 'Đặt lại mật khẩu' → Gửi email chứa mật khẩu mới",
        "Xem lịch sử hoạt động: Chọn người dùng → 'Lịch sử' để xem các thao tác và đăng nhập",
        "Xóa người dùng: Chọn người dùng → 'Xóa' → Xác nhận (Lưu ý: Không thể xóa tài khoản đang hoạt động)"
      ]
    },
    {
      id: 3,
      title: "Theo dõi Dashboard",
      icon: "📊",
      steps: [
        "Vào Dashboard để xem tổng quan hệ thống",
        "Xem các chỉ số chính: Tổng số đại lý, Tổng số người dùng, Tổng số đơn hàng, Doanh số tổng",
        "Theo dõi biểu đồ xu hướng: Doanh số theo thời gian, Đơn hàng theo trạng thái, Người dùng theo vai trò",
        "Xem thống kê đại lý: Top đại lý hoạt động tốt nhất, Đại lý mới, Đại lý có vấn đề",
        "Theo dõi hoạt động người dùng: Số lượt đăng nhập, Hoạt động theo thời gian, Cảnh báo bảo mật",
        "Xem báo cáo hệ thống: Hiệu suất hệ thống, Lỗi và cảnh báo, Thống kê sử dụng",
        "Phân tích xu hướng: Xác định xu hướng kinh doanh, Thời điểm hoạt động cao, Vấn đề cần chú ý"
      ]
    },
    {
      id: 4,
      title: "Cấu hình hệ thống",
      icon: "⚙️",
      steps: [
        "Vào mục 'Cài đặt' để cấu hình hệ thống",
        "Cấu hình chung: Ngôn ngữ, Múi giờ, Định dạng ngày tháng, Định dạng tiền tệ",
        "Cấu hình bảo mật: Độ mạnh mật khẩu, Thời gian phiên đăng nhập, Xác thực 2 yếu tố",
        "Cấu hình thông báo: Email thông báo, Thông báo hệ thống, Cảnh báo bảo mật",
        "Cấu hình hiệu suất: Tối ưu hóa database, Cache, Tốc độ tải trang",
        "Cấu hình tích hợp: API keys, Webhooks, Kết nối dịch vụ bên thứ ba",
        "Sao lưu dữ liệu: Thiết lập lịch sao lưu tự động, Sao lưu thủ công, Khôi phục dữ liệu",
        "Xem logs hệ thống: Xem nhật ký hoạt động, Lỗi hệ thống, Cảnh báo"
      ]
    },
    {
      id: 5,
      title: "Bảo mật hệ thống",
      icon: "🔒",
      steps: [
        "Theo dõi bảo mật: Xem Dashboard để theo dõi các cảnh báo bảo mật",
        "Quản lý phiên đăng nhập: Xem danh sách phiên đăng nhập đang hoạt động, Đăng xuất phiên từ xa",
        "Xem lịch sử đăng nhập: Theo dõi các lần đăng nhập, Địa chỉ IP, Thiết bị, Thời gian",
        "Phát hiện hoạt động bất thường: Xem cảnh báo về đăng nhập từ địa chỉ lạ, Nhiều lần thử đăng nhập sai",
        "Quản lý quyền truy cập: Xem và điều chỉnh quyền truy cập của từng vai trò",
        "Kiểm tra bảo mật: Chạy kiểm tra bảo mật định kỳ, Xem báo cáo lỗ hổng",
        "Xử lý sự cố bảo mật: Khi phát hiện sự cố → Khóa tài khoản liên quan → Điều tra → Khắc phục"
      ]
    },
    {
      id: 6,
      title: "Báo cáo và phân tích",
      icon: "📈",
      steps: [
        "Vào Dashboard để xem các báo cáo tổng quan",
        "Chọn loại báo cáo: Báo cáo đại lý, Báo cáo người dùng, Báo cáo doanh số, Báo cáo hệ thống",
        "Chọn khoảng thời gian: Ngày, Tuần, Tháng, Quý, Năm hoặc tùy chỉnh",
        "Xem biểu đồ và thống kê: Doanh số, Số đơn hàng, Số người dùng, Hiệu suất hệ thống",
        "Lọc theo tiêu chí: Theo đại lý, Theo vai trò, Theo trạng thái, Theo thời gian",
        "So sánh kỳ: So sánh dữ liệu giữa các kỳ để đánh giá tăng trưởng",
        "Xuất báo cáo: Chọn định dạng (Excel, PDF) → Tải xuống để lưu trữ hoặc gửi cho cấp trên",
        "Lên lịch báo cáo: Thiết lập gửi báo cáo tự động theo lịch định kỳ"
      ]
    },
    {
      id: 7,
      title: "Xử lý sự cố và hỗ trợ",
      icon: "🔧",
      steps: [
        "Theo dõi sự cố: Xem Dashboard để phát hiện các sự cố hệ thống",
        "Xem logs hệ thống: Vào 'Cài đặt' → 'Logs' để xem chi tiết lỗi và cảnh báo",
        "Xử lý sự cố người dùng: Xem yêu cầu hỗ trợ từ người dùng → Phân loại → Xử lý",
        "Khôi phục dữ liệu: Nếu có mất dữ liệu → Vào 'Cài đặt' → 'Sao lưu' → Khôi phục từ bản sao lưu",
        "Khắc phục lỗi hệ thống: Xác định nguyên nhân → Áp dụng giải pháp → Kiểm tra lại",
        "Liên hệ hỗ trợ kỹ thuật: Nếu không thể tự xử lý → Liên hệ đội kỹ thuật với thông tin chi tiết",
        "Theo dõi sau xử lý: Đảm bảo sự cố đã được giải quyết hoàn toàn, Không tái diễn"
      ]
    },
    {
      id: 8,
      title: "Quản lý và giám sát hoạt động",
      icon: "👁️",
      steps: [
        "Giám sát hoạt động người dùng: Xem Dashboard để theo dõi hoạt động của tất cả người dùng",
        "Xem lịch sử thao tác: Theo dõi các thao tác quan trọng như tạo, sửa, xóa dữ liệu",
        "Giám sát hiệu suất hệ thống: Xem tốc độ phản hồi, Tải server, Sử dụng tài nguyên",
        "Theo dõi giao dịch: Xem tất cả giao dịch trong hệ thống, Phát hiện giao dịch bất thường",
        "Kiểm tra tuân thủ: Đảm bảo người dùng tuân thủ các quy định và chính sách",
        "Tạo cảnh báo: Thiết lập cảnh báo cho các hoạt động quan trọng hoặc bất thường",
        "Xuất báo cáo giám sát: Tạo báo cáo về hoạt động hệ thống để lưu trữ và phân tích"
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
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Hướng dẫn chi tiết các chức năng dành cho Admin</p>
          </div>
          <button
            onClick={() => navigate('/admin/help')}
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
          Mẹo quản trị hiệu quả
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Thường xuyên kiểm tra Dashboard để phát hiện sớm các vấn đề và xu hướng</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Thiết lập sao lưu tự động và kiểm tra định kỳ để đảm bảo an toàn dữ liệu</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Phân quyền cẩn thận cho từng người dùng để đảm bảo bảo mật và hiệu quả</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Theo dõi logs hệ thống thường xuyên để phát hiện và xử lý sự cố kịp thời</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Sử dụng báo cáo để phân tích xu hướng và đưa ra quyết định quản lý đúng đắn</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Giữ thông tin liên hệ của đội kỹ thuật để xử lý nhanh các sự cố nghiêm trọng</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserGuide;

