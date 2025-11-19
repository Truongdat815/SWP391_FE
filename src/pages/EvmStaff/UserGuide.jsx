import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị trang hướng dẫn sử dụng cho EVM Staff
 * 
 * Component này cung cấp các hướng dẫn chi tiết về các chức năng quản lý
 * bao gồm: quản lý sản phẩm, quản lý xe, quản lý đơn hàng đại lý, quản lý màu sắc,
 * báo cáo bán hàng và các chức năng khác dành cho nhân viên EVM.
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
      title: "Quản lý sản phẩm",
      icon: "📦",
      steps: [
        "Vào mục 'Quản lý sản phẩm' để xem danh sách tất cả sản phẩm",
        "Thêm sản phẩm mới: Nhấn 'Thêm sản phẩm' → Điền thông tin (Tên, Mô tả, Giá sỉ) → Upload hình ảnh → Lưu",
        "Chỉnh sửa sản phẩm: Chọn sản phẩm → Nhấn 'Chỉnh sửa' → Cập nhật thông tin → Lưu",
        "Xem chi tiết sản phẩm: Nhấn vào sản phẩm để xem thông tin đầy đủ, hình ảnh, và thông số kỹ thuật",
        "Quản lý trạng thái: Kích hoạt/Tạm ngưng sản phẩm khi cần",
        "Thiết lập giá sỉ: Chọn sản phẩm → 'Thiết lập giá' → Nhập giá sỉ → Áp dụng cho đại lý",
        "Quản lý hình ảnh: Thêm, xóa, hoặc sắp xếp lại hình ảnh sản phẩm"
      ]
    },
    {
      id: 2,
      title: "Quản lý xe",
      icon: "🚗",
      steps: [
        "Vào mục 'Quản lý xe' để xem danh sách tất cả xe trong kho",
        "Xem tổng quan kho: Số lượng xe theo mẫu, màu sắc, trạng thái",
        "Thêm xe mới vào kho: Nhấn 'Thêm xe' → Chọn mẫu xe → Nhập số lượng → Chọn màu sắc → Lưu",
        "Cập nhật thông tin xe: Chọn xe → 'Chỉnh sửa' → Cập nhật thông tin (Số lượng, Trạng thái, Vị trí kho) → Lưu",
        "Quản lý tồn kho: Theo dõi số lượng tồn kho, cảnh báo khi sắp hết hàng",
        "Xem lịch sử nhập/xuất: Theo dõi các giao dịch nhập kho, xuất kho, điều chuyển",
        "Lọc và tìm kiếm: Sử dụng bộ lọc để tìm xe theo mẫu, màu sắc, trạng thái, vị trí kho"
      ]
    },
    {
      id: 3,
      title: "Xử lý đơn hàng đại lý",
      icon: "📋",
      steps: [
        "Vào mục 'Đơn hàng đại lý' để xem tất cả đơn hàng từ các đại lý",
        "Xem danh sách đơn hàng: Lọc theo trạng thái (Pending, Processing, Completed, Rejected)",
        "Xem chi tiết đơn hàng: Nhấn vào đơn hàng để xem thông tin đầy đủ (Đại lý, Sản phẩm, Số lượng, Giá)",
        "Phê duyệt đơn hàng: Kiểm tra tồn kho → Xác nhận đủ hàng → Nhấn 'Phê duyệt' → Cập nhật trạng thái",
        "Từ chối đơn hàng: Nếu không đủ hàng hoặc có vấn đề → Nhấn 'Từ chối' → Nhập lý do → Gửi thông báo cho đại lý",
        "Cập nhật trạng thái: Theo dõi tiến độ đơn hàng (Đang xử lý, Đã giao hàng, Hoàn thành)",
        "Xuất báo cáo đơn hàng: Chọn khoảng thời gian → Xuất Excel/PDF để báo cáo"
      ]
    },
    {
      id: 4,
      title: "Quản lý màu sắc",
      icon: "🎨",
      steps: [
        "Vào mục 'Quản lý màu sắc' để xem danh sách tất cả màu sắc",
        "Thêm màu sắc mới: Nhấn 'Thêm màu' → Nhập tên màu → Chọn mã màu (HEX/RGB) → Upload hình ảnh mẫu → Lưu",
        "Chỉnh sửa màu sắc: Chọn màu → Nhấn 'Chỉnh sửa' → Cập nhật thông tin → Lưu",
        "Xóa màu sắc: Chọn màu → Nhấn 'Xóa' → Xác nhận (Lưu ý: Chỉ xóa được khi không có xe nào sử dụng màu này)",
        "Xem màu sắc theo mẫu xe: Lọc màu sắc theo từng mẫu xe để quản lý dễ dàng hơn",
        "Quản lý hình ảnh màu: Thêm hình ảnh mẫu màu để đại lý và khách hàng dễ hình dung",
        "Thiết lập màu mặc định: Chọn màu phổ biến làm màu mặc định cho từng mẫu xe"
      ]
    },
    {
      id: 5,
      title: "Báo cáo bán hàng",
      icon: "📊",
      steps: [
        "Vào mục 'Báo cáo bán hàng' để xem các báo cáo và thống kê",
        "Chọn loại báo cáo: Theo thời gian, Theo đại lý, Theo sản phẩm, Tổng hợp",
        "Chọn khoảng thời gian: Ngày, Tuần, Tháng, Quý, Năm hoặc tùy chỉnh",
        "Xem biểu đồ và thống kê: Doanh số, Số đơn hàng, Số xe đã bán, Lợi nhuận",
        "Lọc theo đại lý: Xem hiệu suất bán hàng của từng đại lý",
        "Lọc theo sản phẩm: Xem sản phẩm bán chạy nhất, sản phẩm ít bán",
        "So sánh kỳ: So sánh doanh số giữa các kỳ để đánh giá tăng trưởng",
        "Xuất báo cáo: Chọn định dạng (Excel, PDF) → Tải xuống để gửi cho cấp trên"
      ]
    },
    {
      id: 6,
      title: "Theo dõi Dashboard",
      icon: "📈",
      steps: [
        "Vào Dashboard để xem tổng quan hoạt động hệ thống",
        "Xem các chỉ số chính: Tổng đơn hàng, Doanh số, Số xe trong kho, Số đại lý",
        "Theo dõi biểu đồ xu hướng: Doanh số theo thời gian, Đơn hàng theo trạng thái",
        "Xem thống kê đại lý: Top đại lý bán hàng tốt nhất, Hiệu suất từng đại lý",
        "Theo dõi tồn kho: Số lượng tồn kho, Cảnh báo hết hàng, Giá trị tồn kho",
        "Xem đơn hàng mới: Danh sách đơn hàng đang chờ xử lý, cần phê duyệt",
        "Phân tích xu hướng: Xác định sản phẩm bán chạy, Thời điểm bán tốt nhất, Đại lý hoạt động hiệu quả"
      ]
    },
    {
      id: 7,
      title: "Thiết lập giá sỉ cho đại lý",
      icon: "💰",
      steps: [
        "Vào mục 'Quản lý sản phẩm' → Chọn sản phẩm → 'Thiết lập giá sỉ'",
        "Chọn đại lý: Chọn một hoặc nhiều đại lý để áp dụng giá sỉ",
        "Nhập giá sỉ: Nhập giá sỉ cho từng đại lý (có thể khác nhau tùy theo hợp đồng)",
        "Thiết lập thời gian áp dụng: Chọn ngày bắt đầu và kết thúc (nếu có)",
        "Xem lịch sử thay đổi giá: Theo dõi các thay đổi giá sỉ theo thời gian",
        "Xuất bảng giá sỉ: Tạo bảng giá để gửi cho đại lý hoặc lưu trữ",
        "Cập nhật giá hàng loạt: Áp dụng giá mới cho nhiều sản phẩm cùng lúc"
      ]
    },
    {
      id: 8,
      title: "Quản lý và theo dõi giao hàng",
      icon: "🚚",
      steps: [
        "Theo dõi đơn hàng đã phê duyệt trong mục 'Đơn hàng đại lý'",
        "Cập nhật trạng thái giao hàng: Đang chuẩn bị, Đang vận chuyển, Đã giao hàng",
        "Nhập thông tin vận chuyển: Số vận đơn, Nhà vận chuyển, Ngày giao dự kiến",
        "Xác nhận giao hàng: Khi đại lý xác nhận đã nhận hàng → Cập nhật trạng thái 'Hoàn thành'",
        "Xử lý vấn đề giao hàng: Nếu có vấn đề → Liên hệ đại lý → Cập nhật trạng thái → Ghi chú",
        "Xuất báo cáo giao hàng: Tạo báo cáo về tình trạng giao hàng theo thời gian",
        "Theo dõi hiệu suất giao hàng: Thời gian giao hàng trung bình, Tỷ lệ giao hàng đúng hạn"
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
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Hướng dẫn chi tiết các chức năng dành cho EVM Staff</p>
          </div>
          <button
            onClick={() => navigate('/evm-staff/help')}
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
          Mẹo quản lý hiệu quả
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Thường xuyên kiểm tra tồn kho để đảm bảo đủ hàng cho các đơn hàng từ đại lý</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Xử lý đơn hàng từ đại lý nhanh chóng để duy trì mối quan hệ tốt với đại lý</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Sử dụng báo cáo bán hàng để phân tích xu hướng và đưa ra quyết định về sản xuất và phân phối</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Cập nhật thông tin sản phẩm và màu sắc đầy đủ, chính xác để đại lý có thể tư vấn tốt cho khách hàng</span>
          </li>
          <li className="flex items-start gap-2 sm:gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <span>Theo dõi hiệu suất của từng đại lý để hỗ trợ và phát triển mối quan hệ kinh doanh</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserGuide;

