import React from 'react';

const CommonHelp = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trợ giúp</h1>
        <p className="text-gray-600 mt-1">Tài nguyên và kênh liên hệ khi bạn cần hỗ trợ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Các bước khắc phục nhanh</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> Kiểm tra kết nối mạng và làm mới trang.</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> Đăng xuất và đăng nhập lại tài khoản.</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span> Xóa cache trình duyệt nếu gặp lỗi hiển thị.</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu</h2>
            <div className="space-y-3">
              <a className="block p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition" href="#">Hướng dẫn sử dụng cơ bản</a>
              <a className="block p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition" href="#">Các câu hỏi thường gặp</a>
            </div>
          </section>
        </div>

        <aside className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Liên hệ hỗ trợ</h3>
          <p className="text-gray-700">Email: <a href="mailto:support@electra.com" className="text-red-600">support@electra.com</a></p>
          <p className="text-gray-700">Hotline: <span className="font-medium">1800 0000</span></p>
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">Gửi yêu cầu</button>
        </aside>
      </div>
    </div>
  );
};

export default CommonHelp;


