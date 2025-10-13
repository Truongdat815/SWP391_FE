import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const CommonSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Cài đặt</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Tùy biến trải nghiệm sử dụng theo nhu cầu của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Giao diện</h2>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-xl p-4">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">Chế độ tối</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">Giảm chói và tiết kiệm pin</p>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isDark ? 'bg-emerald-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition transform ${isDark ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Thông báo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-xl p-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">@</div>
                  <span className="text-gray-800 dark:text-gray-100">Email</span>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </label>
              <label className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-xl p-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">•</div>
                  <span className="text-gray-800 dark:text-gray-100">Trên hệ thống</span>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition shadow-sm">Lưu cài đặt</button>
          </div>
        </div>

        <aside className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Mẹo nhanh</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
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


