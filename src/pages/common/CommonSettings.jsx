import React from 'react';

const CommonSettings = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">Tùy biến trải nghiệm sử dụng theo nhu cầu của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Thông báo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <label className="flex items-center justify-between bg-gray-50 border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm sm:text-base flex-shrink-0">@</div>
                  <span className="text-xs sm:text-sm md:text-base text-gray-800">Email</span>
                </div>
                <input type="checkbox" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </label>
              <label className="flex items-center justify-between bg-gray-50 border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm sm:text-base flex-shrink-0">•</div>
                  <span className="text-xs sm:text-sm md:text-base text-gray-800">Trên hệ thống</span>
                </div>
                <input type="checkbox" className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-sm text-xs sm:text-sm md:text-base font-medium">
              Lưu cài đặt
            </button>
          </div>
        </div>

        <aside className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm space-y-3 sm:space-y-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Mẹo nhanh</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <li>Nhấn Ctrl+/ để mở thanh tìm kiếm.</li>
            <li>Kéo thả cột trong bảng để sắp xếp lại.</li>
            <li>Dùng phím Tab/Shift+Tab để chuyển nhanh giữa các ô.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default CommonSettings;


