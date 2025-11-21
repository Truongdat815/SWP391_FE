import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  useGetAllColorsQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} from '../../../api/evmStaff/colorApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const ColorManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    colorName: '',
    colorCode: '',
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { data: colorsData, isLoading, error } = useGetAllColorsQuery();
  const { data: modelColorsData } = useGetAllModelColorsQuery();
  const { data: modelsData } = useGetAllModelsQuery();

  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [deleteColor] = useDeleteColorMutation();

  const colors = colorsData?.data || [];
  const modelColors = modelColorsData?.data || [];
  const models = modelsData?.data || [];

  // Filter colors
  const filteredColors = useMemo(() => {
    return colors.filter((color) => {
      const matchesSearch =
        color.colorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.colorCode?.toLowerCase().includes(searchTerm.toLowerCase());

      if (modelFilter === 'all') return matchesSearch;

      // Lọc theo model - tìm model colors có colorId này và modelId khớp
      const hasModel = modelColors.some(
        (mc) => mc.colorId === color.colorId && mc.modelId?.toString() === modelFilter
      );
      return matchesSearch && hasModel;
    });
  }, [colors, searchTerm, modelFilter, modelColors]);

  // Lấy danh sách models liên kết với mỗi color
  const getAssociatedModels = (colorId) => {
    const associatedModelColors = modelColors.filter((mc) => mc.colorId === colorId);
    return associatedModelColors.map((mc) => {
      const model = models.find((m) => m.modelId === mc.modelId);
      return model?.modelName || `Model ${mc.modelId}`;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.colorName?.trim()) {
      showNotification('Vui lòng nhập tên màu', 'error');
      return;
    }
    
    if (!formData.colorCode || !/^#[0-9A-Fa-f]{6}$/.test(formData.colorCode)) {
      showNotification('Mã màu phải là hex code hợp lệ (ví dụ: #FFFFFF)', 'error');
      return;
    }
    
    try {
      await createColor(formData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({ colorName: '', colorCode: '' });
      setShowColorPicker(false);
      showNotification('Tạo màu mới thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Có lỗi xảy ra khi tạo màu';
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (color) => {
    setSelectedColor(color);
    setFormData({
      colorName: color.colorName || '',
      colorCode: color.colorCode || '',
    });
    setShowColorPicker(false);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.colorName?.trim()) {
      showNotification('Vui lòng nhập tên màu', 'error');
      return;
    }
    
    if (!formData.colorCode || !/^#[0-9A-Fa-f]{6}$/.test(formData.colorCode)) {
      showNotification('Mã màu phải là hex code hợp lệ (ví dụ: #FFFFFF)', 'error');
      return;
    }
    
    try {
      await updateColor({ id: selectedColor.colorId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedColor(null);
      showNotification('Cập nhật màu thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Có lỗi xảy ra khi cập nhật màu';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteClick = (color) => {
    setColorToDelete(color);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return;

    try {
      await deleteColor(colorToDelete.colorId).unwrap();
      setIsDeleteModalOpen(false);
      setColorToDelete(null);
      showNotification('Xóa màu thành công!', 'success');
    } catch (error) {
      setIsDeleteModalOpen(false);
      setColorToDelete(null);
      showNotification('Có lỗi xảy ra khi xóa màu', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  if (isLoading) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </EVMStaffLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;

  if (isUnauthorized) {
    return (
      <EVMStaffLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </EVMStaffLayout>
    );
  }

  if (error) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </EVMStaffLayout>
    );
  }

  const colorPalette = [
    '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF00', '#00CED1',
    '#0000FF', '#4B0082', '#9400D3', '#FF1493', '#FF69B4', '#FFB6C1', '#000000', '#808080',
    '#FFFFFF', '#C0C0C0', '#800000', '#8B0000', '#FF6347', '#FF7F50', '#FFA07A', '#FFDAB9',
    '#F0E68C', '#98FB98', '#90EE90', '#00FA9A', '#48D1CC', '#87CEEB', '#87CEFA', '#4169E1',
    '#000080', '#191970', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#FF00FF', '#FF1493',
    '#DC143C', '#B22222', '#A52A2A', '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3',
  ];

  return (
    <EVMStaffLayout>
      <motion.div
        className="space-y-6 p-6 bg-gray-50/50 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Quản lý Màu sắc
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các tùy chọn màu sắc cho các dòng xe điện
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
          >
            <Plus size={20} className="mr-2" />
            Thêm màu mới
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo tên màu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Lọc theo Model' },
                ...models.map((model) => ({
                  value: model.modelId?.toString(),
                  label: model.modelName || `Model ${model.modelId}`,
                })),
              ]}
              value={modelFilter}
              onChange={setModelFilter}
              className="w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredColors.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <Palette size={48} className="text-gray-300 mb-4" />
              <p>Không tìm thấy màu nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>MÀU HIỂN THỊ</Table.Head>
                    <Table.Head>TÊN MÀU</Table.Head>
                    <Table.Head>MODEL SỬ DỤNG</Table.Head>
                    <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredColors.map((color, index) => {
                    const associatedModels = getAssociatedModels(color.colorId);
                    return (
                      <motion.tr
                        key={color.colorId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <Table.Cell>
                          <div
                            className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                            style={{ backgroundColor: color.colorCode || '#000' }}
                          />
                        </Table.Cell>
                        <Table.Cell className="font-medium text-gray-900">{color.colorName}</Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap gap-2">
                            {associatedModels.length > 0 ? (
                              associatedModels.map((modelName, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100"
                                >
                                  {modelName}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm italic">Chưa sử dụng</span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(color)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(color)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </Table.Cell>
                      </motion.tr>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ colorName: '', colorCode: '' });
          setShowColorPicker(false);
        }}
        title="Thêm màu mới"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tên màu"
            value={formData.colorName}
            onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
            required
            placeholder="Ví dụ: Đỏ mận, Xanh dương..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã màu (Hex Code)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="#000000"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  required
                />
                {formData.colorCode && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-200"
                    style={{ backgroundColor: formData.colorCode }}
                  />
                )}
              </div>
              <div className="relative group">
                <input
                  type="color"
                  value={formData.colorCode || '#000000'}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value.toUpperCase() })}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer overflow-hidden p-0"
                  title="Chọn màu"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Palette size={14} />
                {showColorPicker ? 'Ẩn bảng màu mẫu' : 'Chọn từ bảng màu mẫu'}
              </button>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="grid grid-cols-8 gap-2">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, colorCode: color })}
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:border-blue-500 hover:scale-110 transition-all relative group"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            {formData.colorCode === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={14} className={['#FFFFFF', '#FFFF00'].includes(color) ? 'text-black' : 'text-white'} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isCreating}>
              {isCreating ? 'Đang tạo...' : 'Tạo màu'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedColor(null);
          setFormData({ colorName: '', colorCode: '' });
          setShowColorPicker(false);
        }}
        title="Chỉnh sửa màu"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Tên màu"
            value={formData.colorName}
            onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã màu (Hex Code)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="#000000"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  required
                />
                {formData.colorCode && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-200"
                    style={{ backgroundColor: formData.colorCode }}
                  />
                )}
              </div>
              <input
                type="color"
                value={formData.colorCode || '#000000'}
                onChange={(e) => setFormData({ ...formData, colorCode: e.target.value.toUpperCase() })}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0 overflow-hidden"
                title="Chọn màu"
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Palette size={14} />
                {showColorPicker ? 'Ẩn bảng màu mẫu' : 'Chọn từ bảng màu mẫu'}
              </button>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="grid grid-cols-8 gap-2">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, colorCode: color })}
                            className="w-8 h-8 rounded-lg border border-gray-200 hover:border-blue-500 hover:scale-110 transition-all relative"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            {formData.colorCode === color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={14} className={['#FFFFFF', '#FFFF00'].includes(color) ? 'text-black' : 'text-white'} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedColor(null);
              }}
              className="flex-1"
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isUpdating}>
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setColorToDelete(null);
        }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa màu <strong>{colorToDelete?.colorName}</strong>?
          </p>
          <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100 text-red-600">
            ⚠️ Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setColorToDelete(null);
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
              }`}
          >
            <div className="flex-1">
              {notification.message}
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="text-white hover:text-gray-200 font-bold text-lg"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </EVMStaffLayout>
  );
};

export default ColorManagementPage;
