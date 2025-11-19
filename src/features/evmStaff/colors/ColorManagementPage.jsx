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
  const [formData, setFormData] = useState({
    colorName: '',
    colorCode: '',
  });

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

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa color này?')) {
      try {
        await deleteColor(id).unwrap();
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa color');
        console.error(error);
      }
    }
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
                              onClick={() => handleDelete(color.colorId)}
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
        onClose={() => setIsCreateModalOpen(false)}
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
          <Input
            label="Hex Code"
            placeholder="#000000"
            value={formData.colorCode}
            onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
            required
          />
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
          <Input
            label="Hex Code"
            placeholder="#000000"
            value={formData.colorCode}
            onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
            required
          />
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
    </EVMStaffLayout>
  );
};

export default ColorManagementPage;

