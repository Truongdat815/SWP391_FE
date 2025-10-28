import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllCustomersThunk, getCustomerByIdThunk, clearSelected } from '../../store/slices/customerSlice';
import { createNewOrder } from '../../store/slices/orderSlice';
import { 
  Users, 
  Plus, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Search,
  UserPlus
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

function CreateOrder({ onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: customers, loading: customersLoading, error: customersError, status: customersStatus } = useSelector((state) => state.customers);
  const { loading: orderLoading, error: orderError, success: orderSuccess } = useSelector((state) => state.orders);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByPhone, setSearchByPhone] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState(null);

  // Load customers on component mount and when component becomes visible
  useEffect(() => {
    try {
      dispatch(getAllCustomersThunk());
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [dispatch]);

  // Refresh customers when component becomes visible (e.g., when navigating back from AddCustomer)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(getAllCustomersThunk());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  // Clear messages when component mounts
  useEffect(() => {
    try {
      // Clear any previous errors/success messages
      dispatch(clearSelected());
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  }, [dispatch]);

  // Handle success messages
  useEffect(() => {
    if (customersStatus === 'succeeded') {
      setTimeout(() => {
        dispatch(clearSelected());
      }, 2000);
    }
  }, [customersStatus, dispatch]);

  useEffect(() => {
    if (orderSuccess) {
      setTimeout(() => {
        dispatch(clearSelected());
        if (onBack) {
          onBack();
        }
      }, 2000);
    }
  }, [orderSuccess, dispatch, onBack]);

  // Mock data for testing
  const mockCustomers = [
    { customerId: 1, fullName: 'Nguyễn Văn A', phone: '0123456789', email: 'nguyenvana@email.com', address: '123 Đường ABC, Quận 1, TP.HCM' },
    { customerId: 2, fullName: 'Trần Thị B', phone: '0987654321', email: 'tranthib@email.com', address: '456 Đường XYZ, Quận 2, TP.HCM' },
    { customerId: 3, fullName: 'Lê Văn C', phone: '0555666777', email: 'levanc@email.com', address: '789 Đường DEF, Quận 3, TP.HCM' }
  ];

  // Filter customers based on search term
  const filteredCustomers = (customers && customers.length > 0 ? customers : mockCustomers).filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle customer selection and create order
  const handleCreateOrder = async (customer) => {
    try {
      const result = await dispatch(createNewOrder({ customerId: customer.customerId })).unwrap();
      
      // Extract order data from response
      const orderData = result.data || result;
      console.log('Order created successfully:', orderData);
      
      // Navigate to add order details page immediately
      navigate(`/dealer-staff/add-order-details/${orderData.orderId}`, {
        state: { 
          orderData,
          customerInfo: customer 
        }
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  // Handle navigate to add customer page
  const handleAddCustomer = () => {
    navigate('/dealer-staff/add-customer');
  };

  // Handle successful customer creation
  const handleCustomerAdded = () => {
    // Refresh customers list after adding new customer
        dispatch(getAllCustomersThunk());
  };

  // Handle search by phone
  const handleSearchByPhone = async () => {
    if (searchTerm.trim() && /^0[0-9]{9,10}$/.test(searchTerm.replace(/\s/g, ''))) {
      try {
        // Note: We'll need to implement phone-based search differently
        // For now, we'll search through the existing customers list
        const phoneNumber = searchTerm.replace(/\s/g, '');
        const foundCustomer = customers.find(customer => 
          customer.phone && customer.phone.replace(/\s/g, '') === phoneNumber
        );
        if (foundCustomer) {
          setSelectedCustomer(foundCustomer);
        } else {
          setError('Không tìm thấy khách hàng với số điện thoại này');
        }
      } catch (error) {
        console.error('Error searching customer by phone:', error);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-detect if it's a phone number
    const phonePattern = /^0[0-9]{9,10}$/;
    setSearchByPhone(phonePattern.test(value.replace(/\s/g, '')));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast Notifications */}
      {(customersError || orderError || error) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{customersError || orderError || error}</span>
        </div>
      )}
      
      {orderSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{orderSuccess}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Tạo đơn hàng mới</h2>
          </div>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </button>
        </div>

        {/* Customer Selection Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Chọn khách hàng</h3>
            </div>
            <Tooltip content="Thêm khách hàng mới nếu chưa có trong hệ thống" placement="left">
              <button
                type="button"
                onClick={handleAddCustomer}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm khách hàng mới
              </button>
            </Tooltip>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khách hàng theo tên, số điện thoại hoặc email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {searchByPhone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                      Số điện thoại
                    </span>
                  </div>
                )}
              </div>
              {searchByPhone && (
                <button
                  onClick={handleSearchByPhone}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tìm theo SĐT
                </button>
              )}
            </div>
          </div>

          {/* Customer List */}
          {customersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
              <span className="text-gray-600">Đang tải danh sách khách hàng...</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={handleAddCustomer}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm khách hàng đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tên</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Số điện thoại</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Địa chỉ</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.customerId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-900">{customer.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {customer.email || 'Chưa có'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate max-w-xs">{customer.address}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleCreateOrder(customer)}
                          disabled={orderLoading}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                        >
                          {orderLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Tạo đơn hàng
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
