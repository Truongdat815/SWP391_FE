import { Link } from 'react-router-dom';

function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-600">TEST PAGE - ROUTING WORKS!</h1>
      <p className="text-lg text-gray-700 mt-4">
        Nếu bạn thấy trang này, có nghĩa là routing đã hoạt động đúng cách.
      </p>
      <div className="mt-6 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">✅ Routing system is working correctly!</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Test các trang khác:</h2>
        <div className="space-y-2">
          <Link to="/dealer-manager" className="block text-blue-600 hover:underline">← Quay lại Dashboard</Link>
          <Link to="/dealer-manager/tao-bao-cao" className="block text-blue-600 hover:underline">📝 Tạo báo cáo</Link>
          <Link to="/dealer-manager/bao-cao-doanh-so" className="block text-blue-600 hover:underline">💰 Báo cáo doanh số</Link>
          <Link to="/dealer-manager/quan-ly-nhan-vien" className="block text-blue-600 hover:underline">👥 Quản lý nhân viên</Link>
          <Link to="/dealer-manager/quan-ly-cong-no" className="block text-blue-600 hover:underline">📋 Quản lý công nợ</Link>
          <Link to="/dealer-manager/xuat-bao-cao" className="block text-blue-600 hover:underline">⚡ Xuất báo cáo</Link>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
