import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CommonHelp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine base path based on current route
  const getBasePath = () => {
    if (location.pathname.includes('/dealer-staff')) {
      return '/dealer-staff';
    } else if (location.pathname.includes('/dealer-manager')) {
      return '/dealer-manager';
    } else if (location.pathname.includes('/evm-staff')) {
      return '/evm-staff';
    } else if (location.pathname.includes('/admin')) {
      return '/admin';
    }
    return '';
  };

  const basePath = getBasePath();

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Trợ giúp</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">Tài nguyên và kênh liên hệ khi bạn cần hỗ trợ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          <section className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Các bước khắc phục nhanh</h2>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-gray-700">
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span>Kiểm tra kết nối mạng và làm mới trang.</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span>Đăng xuất và đăng nhập lại tài khoản.</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span>Xóa cache trình duyệt nếu gặp lỗi hiển thị.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tài liệu</h2>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => navigate(`${basePath}/user-guide`)}
                className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 text-xs sm:text-sm md:text-base flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl">📖</span>
                  <span className="font-medium text-gray-900">Hướng dẫn sử dụng cơ bản</span>
                </span>
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => navigate(`${basePath}/faq`)}
                className="w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 text-xs sm:text-sm md:text-base flex items-center justify-between group"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl">❓</span>
                  <span className="font-medium text-gray-900">Các câu hỏi thường gặp</span>
                </span>
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        </div>

        <aside className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Liên hệ hỗ trợ</h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-700">
            Email: <a href="mailto:support@electra.com" className="text-red-600 hover:text-red-700">support@electra.com</a>
          </p>
          <p className="text-xs sm:text-sm md:text-base text-gray-700">
            Hotline: <span className="font-medium">1800 0000</span>
          </p>
          <button className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-all duration-200 text-xs sm:text-sm md:text-base font-medium">
            Gửi yêu cầu
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CommonHelp;


