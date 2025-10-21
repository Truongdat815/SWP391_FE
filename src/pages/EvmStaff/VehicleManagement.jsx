import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllModelsThunk,
  createModelThunk,
  updateModelThunk,
  deleteModelThunk,
} from '@store/slices/modelSlice';

// Prevent scroll wheel on number inputs
const handleWheelOnNumberInput = (e) => {
  e.target.blur();
  e.preventDefault();
};

const BODY_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'VAN', label: 'Van' },
];

function VehicleManagement() {
  const dispatch = useDispatch();
  const { items: models, status } = useSelector((s) => s.models);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    modelName: '',
    modelYear: new Date().getFullYear(),
    bodyType: 'SEDAN',
    batteryCapacity: '',
    range: '',
    powerHp: '',
    torqueNm: '',
    acceleration: '',
    seatingCapacity: 5,
    price: '',
    description: '',
  });

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const resetForm = () => {
    setFormData({
      modelName: '',
      modelYear: new Date().getFullYear(),
      bodyType: 'SEDAN',
      batteryCapacity: '',
      range: '',
      powerHp: '',
      torqueNm: '',
      acceleration: '',
      seatingCapacity: 5,
      price: '',
      description: '',
    });
  };

  const handleOpenCreate = () => {
    setEditingModel(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model) => {
    setEditingModel(model);
    setFormData({
      modelName: model.modelName || '',
      modelYear: model.modelYear || new Date().getFullYear(),
      bodyType: model.bodyType || 'SEDAN',
      batteryCapacity: model.batteryCapacity || '',
      range: model.range || '',
      powerHp: model.powerHp || '',
      torqueNm: model.torqueNm || '',
      acceleration: model.acceleration || '',
      seatingCapacity: model.seatingCapacity || 5,
      price: model.price || '',
      description: model.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        modelName: formData.modelName.trim(),
        description: formData.description.trim(),
        batteryCapacity: parseFloat(formData.batteryCapacity),
        range: parseFloat(formData.range),
        powerHp: parseFloat(formData.powerHp),
        torqueNm: parseFloat(formData.torqueNm),
        acceleration: parseFloat(formData.acceleration),
        seatingCapacity: parseInt(formData.seatingCapacity),
        price: parseFloat(formData.price),
        modelYear: parseInt(formData.modelYear),
      };

      if (editingModel) {
        await dispatch(updateModelThunk({ ...payload, modelId: editingModel.modelId })).unwrap();
        showNotification('success', 'Cập nhật xe thành công!');
      } else {
        await dispatch(createModelThunk(payload)).unwrap();
        showNotification('success', 'Tạo xe mới thành công!');
      }
      
      // ✅ Reload data to get latest from backend
      await dispatch(getAllModelsThunk()).unwrap();
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      showNotification('error', err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (model) => {
    if (!window.confirm(`Xóa "${model.modelName}"?`)) return;
    
    try {
      await dispatch(deleteModelThunk(model.modelId)).unwrap();
      showNotification('success', 'Đã xóa xe!');
      
      // ✅ Reload data to ensure consistency
      await dispatch(getAllModelsThunk()).unwrap();
    } catch (err) {
      showNotification('error', err?.message || 'Không thể xóa xe');
    }
  };

  const filteredModels = models.filter(model =>
    !searchTerm || model.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* CSS to hide number input arrows */}
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>

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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý xe</h1>
              <p className="text-gray-500 mt-1">Quản lý danh sách xe điện</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm xe mới
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm xe..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {status === 'loading' && models.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy xe nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên xe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Năm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pin (kWh)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tầm xa (km)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá ($)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredModels.map((model) => (
                    <tr key={model.modelId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{model.modelName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.modelYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {BODY_TYPES.find(t => t.value === model.bodyType)?.label || model.bodyType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.batteryCapacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.range}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${model.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEdit(model)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(model)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredModels.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Hiển thị {filteredModels.length} / {models.length} xe
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
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {editingModel ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
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
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-2 gap-4">
                  {/* Model Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.modelName}
                      onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Electra CityLink"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.modelYear}
                      onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={2020}
                      max={2030}
                    />
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kiểu dáng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.bodyType}
                      onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {BODY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Battery Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pin (kWh) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.batteryCapacity}
                      onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={0.1}
                    />
                  </div>

                  {/* Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tầm xa (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.range}
                      onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={0.1}
                    />
                  </div>

                  {/* Power HP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Công suất (HP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.powerHp}
                      onChange={(e) => setFormData({ ...formData, powerHp: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={0.1}
                    />
                  </div>

                  {/* Torque */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô-men xoắn (Nm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.torqueNm}
                      onChange={(e) => setFormData({ ...formData, torqueNm: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={0.1}
                    />
                  </div>

                  {/* Acceleration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tăng tốc 0-100 (s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.acceleration}
                      onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={0.1}
                    />
                  </div>

                  {/* Seating Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số chỗ ngồi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.seatingCapacity}
                      onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={2}
                      max={9}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      onWheel={handleWheelOnNumberInput}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={0.01}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="Mô tả chi tiết về xe..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {status === 'loading' ? 'Đang xử lý...' : (editingModel ? 'Cập nhật' : 'Tạo xe')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
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

export default VehicleManagement;
