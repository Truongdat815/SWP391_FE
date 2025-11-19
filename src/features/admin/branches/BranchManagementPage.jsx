import { useState } from 'react';
import { Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  useGetAllStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useGetStoreStatusesQuery,
} from '../../../api/admin/storeApi';

const BranchManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
  });

  const { data: storesResponse, isLoading, error } = useGetAllStoresQuery();
  const { data: statusesResponse } = useGetStoreStatusesQuery();
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  const stores = storesResponse?.data || [];
  const statuses = statusesResponse?.data || ['ACTIVE', 'INACTIVE'];

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.phone?.includes(searchTerm) ||
      store.storeId?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: 'success', label: 'Hoạt động' },
      INACTIVE: { variant: 'error', label: 'Ngừng hoạt động' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createStore(formData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        storeName: '',
        address: '',
        phone: '',
        email: '',
        status: 'ACTIVE',
      });
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo chi nhánh');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      storeName: store.storeName || '',
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      status: store.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateStore({ storeId: selectedStore.storeId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedStore(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật chi nhánh');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (storeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
      try {
        await deleteStore(storeId).unwrap();
      } catch (error) {
        alert(error?.data?.message || 'Có lỗi xảy ra khi xóa chi nhánh');
        if (import.meta.env.DEV) {
          console.error(error);
        }
      }
    }
    setOpenMenuId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Chi nhánh</h1>
            <p className="text-gray-600 mt-1">
              Xem, tìm kiếm, và quản lý tất cả các chi nhánh trong hệ thống
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Thêm Chi nhánh
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <SearchBar
            placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại, mã chi nhánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Mã</Table.Head>
                  <Table.Head>Tên Chi nhánh</Table.Head>
                  <Table.Head>Địa chỉ</Table.Head>
                  <Table.Head>Số điện thoại</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Trạng thái</Table.Head>
                  <Table.Head className="text-right">Hành động</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredStores.map((store) => (
                  <Table.Row key={store.storeId}>
                    <Table.Cell className="font-medium">#{store.storeId}</Table.Cell>
                    <Table.Cell className="font-medium">
                      {store.storeName || `Chi nhánh ${store.storeId}`}
                    </Table.Cell>
                    <Table.Cell>{store.address || 'Chưa cập nhật'}</Table.Cell>
                    <Table.Cell>{store.phone || 'N/A'}</Table.Cell>
                    <Table.Cell>{store.email || 'N/A'}</Table.Cell>
                    <Table.Cell>{getStatusBadge(store.status)}</Table.Cell>
                    <Table.Cell>
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === store.storeId ? null : store.storeId)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === store.storeId && (
                          <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleEdit(store)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={16} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDelete(store.storeId)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Hiển thị 1-{filteredStores.length} của {filteredStores.length} chi nhánh
          </p>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Chi nhánh"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tên chi nhánh"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            required
          />
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStore(null);
        }}
        title="Chỉnh sửa Chi nhánh"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Tên chi nhánh"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            required
          />
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedStore(null);
              }}
              className="flex-1"
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default BranchManagementPage;
