import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllColorsThunk,
  createColorThunk,
  updateColorThunk,
  deleteColorThunk
} from '@/store/slices/colorSlice';

// Danh sách màu cơ bản để mapping hex -> tên màu
const BASIC_COLORS = [
  { name: 'Đen', hex: '#000000' },
  { name: 'Trắng', hex: '#FFFFFF' },
  { name: 'Đỏ', hex: '#FF0000' },
  { name: 'Xanh Lá', hex: '#00FF00' },
  { name: 'Xanh Dương', hex: '#0000FF' },
  { name: 'Vàng', hex: '#FFFF00' },
  { name: 'Cam', hex: '#FFA500' },
  { name: 'Tím', hex: '#800080' },
  { name: 'Hồng', hex: '#FFC0CB' },
  { name: 'Nâu', hex: '#A52A2A' },
  { name: 'Xám', hex: '#808080' },
  { name: 'Bạc', hex: '#C0C0C0' },
  { name: 'Xám Đậm', hex: '#4D4D4D' },
  { name: 'Xanh Navy', hex: '#000080' },
  { name: 'Xanh Lục', hex: '#008000' },
  { name: 'Đỏ Đậm', hex: '#8B0000' },
  { name: 'Xanh Lơ', hex: '#00FFFF' },
  { name: 'Đỏ Tươi', hex: '#FF6347' },
];

// Function: Tính khoảng cách giữa 2 màu (Euclidean distance trong RGB)
const colorDistance = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

// Function: Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Function: Tìm tên màu gần nhất
const findClosestColorName = (hexCode) => {
  if (!hexCode || hexCode.length !== 7) return '';
  
  let closestColor = BASIC_COLORS[0];
  let minDistance = colorDistance(hexCode, closestColor.hex);
  
  BASIC_COLORS.forEach(color => {
    const distance = colorDistance(hexCode, color.hex);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  });
  
  return closestColor.name;
};

const ColorManagement = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const colors = useSelector(state => state.colors.items);
  const status = useSelector(state => state.colors.status);
  const error = useSelector(state => state.colors.error);
  
  // Local state
  const [customColor, setCustomColor] = useState({
    colorName: '',
    colorCode: '#000000'
  });
  const [editingColor, setEditingColor] = useState(null);

  // Load colors khi component mount
  useEffect(() => {
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  // Handler: Thay đổi mã màu và tự động điền tên
  const handleColorCodeChange = (newColorCode) => {
    setCustomColor(prev => {
      // Nếu colorName đang trống hoặc là tên được auto-generate, tự động điền tên mới
      const shouldAutoFill = !prev.colorName || 
        BASIC_COLORS.some(c => c.name === prev.colorName);
      
      const newColorName = shouldAutoFill 
        ? findClosestColorName(newColorCode) 
        : prev.colorName;
      
      return {
        colorName: newColorName,
        colorCode: newColorCode
      };
    });
  };

  // Handler: Tạo màu
  const handleCreateCustom = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(createColorThunk({
        colorName: customColor.colorName,
        colorCode: customColor.colorCode
      })).unwrap();
      
      // Reset form
      setCustomColor({ colorName: '', colorCode: '#000000' });
      alert(`✅ Đã tạo màu "${customColor.colorName}"!`);
    } catch (error) {
      alert(`❌ Lỗi: ${error}`);
    }
  };

  // Handler: Xóa màu
  const handleDelete = async (colorId, colorName) => {
    if (window.confirm(`Bạn có chắc muốn xóa màu "${colorName}"?`)) {
      try {
        await dispatch(deleteColorThunk(colorId)).unwrap();
        alert('✅ Đã xóa màu!');
      } catch (error) {
        alert(`❌ Lỗi: ${error}`);
      }
    }
  };

  // Handler: Cập nhật màu
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(updateColorThunk({
        colorId: editingColor.colorId,
        colorName: editingColor.colorName,
        colorCode: editingColor.colorCode
      })).unwrap();
      
      setEditingColor(null);
      alert('✅ Đã cập nhật màu!');
    } catch (error) {
      alert(`❌ Lỗi: ${error}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎨 Quản lý Màu sắc</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create Color Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Thêm màu mới</h2>

            {/* Color Form */}
            <form onSubmit={handleCreateCustom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên màu
                  </label>
                  <input
                    type="text"
                    value={customColor.colorName}
                    onChange={(e) => setCustomColor({ 
                      ...customColor, 
                      colorName: e.target.value 
                    })}
                    placeholder="Ví dụ: Xanh Cốm Đặc Biệt"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã màu
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customColor.colorCode}
                      onChange={(e) => handleColorCodeChange(e.target.value)}
                      className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor.colorCode}
                      onChange={(e) => handleColorCodeChange(e.target.value)}
                      placeholder="#FF0000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn màu hoặc nhập mã hex → tên màu sẽ tự động điền
                  </p>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xem trước
                  </label>
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div
                      style={{ backgroundColor: customColor.colorCode }}
                      className="w-24 h-24 rounded-lg border-2 border-gray-300 shadow-sm"
                    />
                    <div>
                      <div className="font-semibold text-lg">
                        {customColor.colorName || '(Chưa đặt tên)'}
                      </div>
                      <div className="text-gray-600">{customColor.colorCode}</div>
                    </div>
                  </div>
                </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? 'Đang tạo...' : 'Tạo màu mới'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Colors List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Danh sách màu ({colors.length})
            </h2>

            {status === 'loading' && colors.length === 0 && (
              <p className="text-gray-500 text-center py-8">Đang tải...</p>
            )}

            {status === 'succeeded' && colors.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Chưa có màu nào. Nhập thông tin màu ở bên trái!
              </p>
            )}

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {colors.map((color, index) => (
                <div
                  key={color.colorId || `color-${index}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      style={{ backgroundColor: color.colorCode }}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {color.colorName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {color.colorCode}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setEditingColor(color)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(color.colorId, color.colorName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Chỉnh sửa màu</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên màu
                </label>
                <input
                  type="text"
                  value={editingColor.colorName}
                  onChange={(e) => setEditingColor({ 
                    ...editingColor, 
                    colorName: e.target.value 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã màu
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={editingColor.colorCode}
                    onChange={(e) => setEditingColor({ 
                      ...editingColor, 
                      colorCode: e.target.value 
                    })}
                    className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingColor.colorCode}
                    onChange={(e) => setEditingColor({ 
                      ...editingColor, 
                      colorCode: e.target.value 
                    })}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingColor(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorManagement;

