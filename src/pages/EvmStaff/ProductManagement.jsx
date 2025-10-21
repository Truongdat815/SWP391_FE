import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllModelColorsThunk,
  createModelColorThunk,
  updateModelColorThunk,
  deleteModelColorThunk,
} from '@store/slices/modelColorSlice';
import { getAllModelsThunk } from '@store/slices/modelSlice';
import { getAllColorsThunk } from '@store/slices/colorSlice';

function ProductManagement() {
  const dispatch = useDispatch();
  const { items: modelColors, status } = useSelector((s) => s.modelColors);
  const { items: models } = useSelector((s) => s.models);
  const { items: colors } = useSelector((s) => s.colors);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterColor, setFilterColor] = useState('');

  const [formData, setFormData] = useState({
    modelId: '',
    colorId: '',
    imagePath: '',
  });

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    dispatch(getAllModelColorsThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const resetForm = () => {
    setFormData({ modelId: '', colorId: '', imagePath: '' });
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      modelId: item.modelId,
      colorId: item.colorId,
      imagePath: item.imagePath || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get model and color details
      const selectedModel = models.find(m => m.modelId === parseInt(formData.modelId, 10));
      const selectedColor = colors.find(c => c.colorId === parseInt(formData.colorId, 10));

      const payload = {
        modelId: parseInt(formData.modelId, 10),
        modelName: selectedModel?.modelName || '',
        colorId: parseInt(formData.colorId, 10),
        colorName: selectedColor?.colorName || '',
        colorCode: selectedColor?.colorCode || '',
        imagePath: formData.imagePath.trim(),
      };

      if (editingItem) {
        // Update - use modelColorId
        payload.modelColorId = editingItem.modelColorId;
        await dispatch(updateModelColorThunk({ id: editingItem.modelColorId, data: payload })).unwrap();
        showNotification('success', 'Cập nhật sản phẩm thành công!');
      } else {
        await dispatch(createModelColorThunk(payload)).unwrap();
        showNotification('success', 'Tạo sản phẩm thành công!');
      }

      // Reload data
      await dispatch(getAllModelColorsThunk()).unwrap();

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      showNotification('error', err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (item) => {
    const modelName = models.find(m => m.modelId === item.modelId)?.modelName || 'xe này';
    const colorName = colors.find(c => c.colorId === item.colorId)?.colorName || 'màu này';

    if (!window.confirm(`Xóa sản phẩm "${modelName} - ${colorName}"?`)) return;

    try {
      // Use modelColorId from item
      await dispatch(deleteModelColorThunk(item.modelColorId)).unwrap();
      showNotification('success', 'Đã xóa sản phẩm!');

      // Reload data
      await dispatch(getAllModelColorsThunk()).unwrap();
    } catch (err) {
      showNotification('error', err?.message || 'Không thể xóa sản phẩm');
    }
  };

  // Get model/color names
  const getModelName = (modelId) => {
    return models.find(m => m.modelId === modelId)?.modelName || `Model #${modelId}`;
  };

  const getColorName = (colorId) => {
    return colors.find(c => c.colorId === colorId)?.colorName || `Color #${colorId}`;
  };

  const getColorCode = (colorId) => {
    return colors.find(c => c.colorId === colorId)?.colorCode || '#CCCCCC';
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return modelColors.filter(item => {
      const modelName = getModelName(item.modelId).toLowerCase();
      const colorName = getColorName(item.colorId).toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || 
        modelName.includes(searchLower) || 
        colorName.includes(searchLower) ||
        item.imagePath?.toLowerCase().includes(searchLower);

      const matchesModel = !filterModel || item.modelId === parseInt(filterModel, 10);
      const matchesColor = !filterColor || item.colorId === parseInt(filterColor, 10);

      return matchesSearch && matchesModel && matchesColor;
    });
  }, [modelColors, searchTerm, filterModel, filterColor, models, colors]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
              <p className="text-gray-500 mt-1">Quản lý xe và màu sắc</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Filter by Model */}
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả xe</option>
              {models.map(model => (
                <option key={model.modelId} value={model.modelId}>
                  {model.modelName}
                </option>
              ))}
            </select>

            {/* Filter by Color */}
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả màu</option>
              {colors.map(color => (
                <option key={color.colorId} value={color.colorId}>
                  {color.colorName}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterModel('');
                setFilterColor('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {status === 'loading' && modelColors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Màu sắc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredItems.map((item, index) => (
                      <motion.tr 
                        key={item.modelColorId || `${item.modelId}-${item.colorId}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{getModelName(item.modelId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: getColorCode(item.colorId) }}
                            />
                            <span className="text-gray-900">{getColorName(item.colorId)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {item.imagePath ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={item.imagePath} 
                                  alt={`${getModelName(item.modelId)} - ${getColorName(item.colorId)}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 truncate max-w-xs">
                                {item.imagePath}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Chưa có hình ảnh</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {filteredItems.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Hiển thị {filteredItems.length} / {modelColors.length} sản phẩm
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
                <h3 className="text-lg font-semibold text-white">
                  {editingItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:bg-blue-700 rounded p-1"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Model Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xe <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.modelId}
                      onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!!editingItem}
                    >
                      <option value="">Chọn xe</option>
                      {models.map(model => (
                        <option key={model.modelId} value={model.modelId}>
                          {model.modelName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.colorId}
                      onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!!editingItem}
                    >
                      <option value="">Chọn màu</option>
                      {colors.map(color => (
                        <option key={color.colorId} value={color.colorId}>
                          {color.colorName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Path */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đường dẫn hình ảnh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.imagePath}
                      onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: /images/car1.jpg"
                      required
                    />
                  </div>

                  {/* Preview */}
                  {formData.imagePath && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xem trước
                      </label>
                      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                        <img
                          src={formData.imagePath}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingItem ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductManagement;
