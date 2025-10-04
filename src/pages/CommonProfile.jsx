import React from 'react';

const CommonProfile = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Thông tin cá nhân</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
          <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input className="w-full border rounded-lg px-3 py-2" placeholder="user@electra.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input className="w-full border rounded-lg px-3 py-2" placeholder="0900 000 000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" disabled value="—" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Lưu thay đổi</button>
      </div>
    </div>
  );
};

export default CommonProfile;


