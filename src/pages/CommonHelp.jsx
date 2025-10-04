import React from 'react';

const CommonHelp = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Trợ giúp</h1>
      <div className="space-y-4 text-gray-700">
        <p>Nếu bạn gặp sự cố, vui lòng thử các bước sau:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Kiểm tra lại kết nối mạng và làm mới trang.</li>
          <li>Đăng xuất và đăng nhập lại tài khoản.</li>
          <li>Liên hệ bộ phận hỗ trợ: <a href="mailto:support@electra.com" className="text-red-600">support@electra.com</a></li>
        </ul>
        <div className="mt-4">
          <a href="#" className="text-red-600 hover:underline">Xem tài liệu hướng dẫn</a>
        </div>
      </div>
    </div>
  );
};

export default CommonHelp;


