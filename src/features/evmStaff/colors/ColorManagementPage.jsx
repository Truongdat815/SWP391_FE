import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
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
    try {
      await createColor(formData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({ colorName: '', colorCode: '' });
      setShowColorPicker(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo color');
      console.error(error);
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
    try {
      await updateColor({ id: selectedColor.colorId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedColor(null);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật color');
      console.error(error);
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
      console.error(error);
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

  return (
    <EVMStaffLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Color Management</h1>
            <p className="text-gray-600 mt-1">
              Add, edit, and manage color options for electric vehicle models.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Add New Color
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search by Color Name or Hex Code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Filter by Model' },
                ...models.map((model) => ({
                  value: model.modelId?.toString(),
                  label: model.modelName || `Model ${model.modelId}`,
                })),
              ]}
              value={modelFilter}
              onChange={setModelFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredColors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>COLOR IMAGE</Table.Head>
                    <Table.Head>COLOR NAME</Table.Head>
                    <Table.Head>HEX CODE</Table.Head>
                    <Table.Head>ASSOCIATED MODELS</Table.Head>
                    <Table.Head className="text-center">ACTIONS</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredColors.map((color) => {
                    const associatedModels = getAssociatedModels(color.colorId);
                    return (
                      <Table.Row key={color.colorId}>
                        <Table.Cell>
                          <div
                            className="w-16 h-12 rounded border border-gray-300"
                            style={{ backgroundColor: color.colorCode || '#000' }}
                          />
                        </Table.Cell>
                        <Table.Cell className="font-medium">{color.colorName}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.colorCode || '#000' }}
                            />
                            <span className="font-mono text-sm">{color.colorCode || 'N/A'}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap gap-2">
                            {associatedModels.length > 0 ? (
                              associatedModels.map((modelName, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {modelName}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">No models</span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(color)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(color)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ colorName: '', colorCode: '' });
          setShowColorPicker(false);
        }}
        title="Add New Color"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Color Name"
            value={formData.colorName}
            onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hex Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="#000000"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  required
                />
                {formData.colorCode && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: formData.colorCode }}
                  />
                )}
              </div>
              <input
                type="color"
                value={formData.colorCode || '#000000'}
                onChange={(e) => setFormData({ ...formData, colorCode: e.target.value.toUpperCase() })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                title="Chọn màu"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showColorPicker ? 'Ẩn bảng màu' : 'Hiển thị bảng màu'}
            </button>
            {showColorPicker && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF00', '#00CED1',
                    '#0000FF', '#4B0082', '#9400D3', '#FF1493', '#FF69B4', '#FFB6C1', '#000000', '#808080',
                    '#FFFFFF', '#C0C0C0', '#800000', '#8B0000', '#FF6347', '#FF7F50', '#FFA07A', '#FFDAB9',
                    '#F0E68C', '#98FB98', '#90EE90', '#00FA9A', '#48D1CC', '#87CEEB', '#87CEFA', '#4169E1',
                    '#000080', '#191970', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#FF00FF', '#FF1493',
                    '#DC143C', '#B22222', '#A52A2A', '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorCode: color })}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
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
        title="Edit Color"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Color Name"
            value={formData.colorName}
            onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hex Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="#000000"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  required
                />
                {formData.colorCode && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: formData.colorCode }}
                  />
                )}
              </div>
              <input
                type="color"
                value={formData.colorCode || '#000000'}
                onChange={(e) => setFormData({ ...formData, colorCode: e.target.value.toUpperCase() })}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                title="Chọn màu"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showColorPicker ? 'Ẩn bảng màu' : 'Hiển thị bảng màu'}
            </button>
            {showColorPicker && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00', '#ADFF2F', '#00FF00', '#00CED1',
                    '#0000FF', '#4B0082', '#9400D3', '#FF1493', '#FF69B4', '#FFB6C1', '#000000', '#808080',
                    '#FFFFFF', '#C0C0C0', '#800000', '#8B0000', '#FF6347', '#FF7F50', '#FFA07A', '#FFDAB9',
                    '#F0E68C', '#98FB98', '#90EE90', '#00FA9A', '#48D1CC', '#87CEEB', '#87CEFA', '#4169E1',
                    '#000080', '#191970', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#FF00FF', '#FF1493',
                    '#DC143C', '#B22222', '#A52A2A', '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3',
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorCode: color })}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
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
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update'}
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
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
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
              className="flex-1"
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
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
        </div>
      )}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </EVMStaffLayout>
  );
};

export default ColorManagementPage;

