import React from 'react';

const CommonProfile = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white shadow">
            <span className="text-red-600 font-bold">NV</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600">Cập nhật hồ sơ để đồng bộ trên toàn hệ thống</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 transition hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 bg-white text-gray-900" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 bg-white text-gray-900" placeholder="user@electra.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 bg-white text-gray-900" placeholder="0900 000 000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <input className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 bg-white text-gray-900 bg-white text-gray-900" disabled value="—" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Lần cập nhật gần nhất: hôm nay</p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition shadow-sm bg-white text-gray-900">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
};

export default CommonProfile;


