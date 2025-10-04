import React from 'react';

const CommonSettings = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Cài đặt</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Giao diện</h2>
          <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
            <span className="text-gray-700">Chế độ tối</span>
            <input type="checkbox" className="h-5 w-5" />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Thông báo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 bg-gray-50 border rounded-lg p-4">
              <input type="checkbox" />
              <span>Email</span>
            </label>
            <label className="flex items-center space-x-3 bg-gray-50 border rounded-lg p-4">
              <input type="checkbox" />
              <span>Trên hệ thống</span>
            </label>
          </div>
        </section>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Lưu cài đặt</button>
        </div>
      </div>
    </div>
  );
};

export default CommonSettings;


