import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../features/public/home/HomePage';
import LoginPage from '../features/public/login/LoginPage';
import ChangePasswordPage from '../features/public/change-password/ChangePasswordPage';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Admin routes
import AdminDashboard from '../features/admin/dashboard/AdminDashboard';
import UserManagement from '../features/admin/accounts/UserManagementPage';
import BranchManagement from '../features/admin/branches/BranchManagementPage';

// Dealer Staff routes
import DealerStaffDashboard from '../features/dealerStaff/dashboard/DashboardPage';
import DealerStaffOrderManagementPage from '../features/dealerStaff/orders/OrderManagementPage';
import CreateOrderPage from '../features/dealerStaff/orders/CreateOrderPage';
import ContractManagementPage from '../features/dealerStaff/contracts/ContractManagementPage';
import ViewContractPage from '../features/dealerStaff/contracts/ViewContractPage';
import PaymentManagementPage from '../features/dealerStaff/payments/PaymentManagementPage';
import CustomerManagementPage from '../features/dealerStaff/customers/CustomerManagementPage';
import AppointmentsPage from '../features/dealerStaff/appointments/AppointmentsPage';
import QuotationPage from '../features/dealerStaff/quotation/QuotationPage';
import ProductsPage from '../features/dealerStaff/products/ProductsPage';
import StoreStockPage from '../features/dealerStaff/storeStock/StoreStockPage';
import ReportsPage from '../features/dealerStaff/reports/ReportsPage';

// Dealer Manager routes
import DealerManagerDashboard from '../features/dealerManager/dashboard/DashboardPage';
import DealerManagerInventoryPage from '../features/dealerManager/inventory/InventoryPage';
import DealerManagerOrderManagementPage from '../features/dealerManager/order/OrderManagementPage';
import PromotionPage from '../features/dealerManager/promotion/PromotionPage';
import StaffPage from '../features/dealerManager/staff/StaffPage';

// EVM Staff routes
import EvmStaffDashboard from '../features/evmStaff/dashboard/DashboardPage';
import ProductManagementPage from '../features/evmStaff/products/ProductManagementPage';
import DealerOrdersPage from '../features/evmStaff/orders/DealerOrdersPage';
import ColorManagementPage from '../features/evmStaff/colors/ColorManagementPage';
import DealersPage from '../features/evmStaff/dealers/DealersPage';
import EvmStaffReportsPage from '../features/evmStaff/reports/ReportsPage';
import SettingsPage from '../features/evmStaff/settings/SettingsPage';

function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes - Protected by authentication and role */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="accounts" element={<UserManagement />} />
                <Route path="branches" element={<BranchManagement />} />
                <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Dealer Staff routes - Protected by authentication and role */}
      <Route
        path="/dealer-staff/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['DEALER_STAFF']}>
              <Routes>
                <Route path="dashboard" element={<DealerStaffDashboard />} />
                <Route path="orders" element={<DealerStaffOrderManagementPage />} />
                <Route path="orders/create" element={<CreateOrderPage />} />
                <Route path="contracts" element={<ContractManagementPage />} />
                <Route path="contracts/:contractId/view" element={<ViewContractPage />} />
                <Route path="payments" element={<PaymentManagementPage />} />
                <Route path="payments/callback" element={<PaymentManagementPage />} />
                <Route path="customers" element={<CustomerManagementPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="quotation" element={<QuotationPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="storestock" element={<StoreStockPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="" element={<Navigate to="/dealer-staff/dashboard" replace />} />
              </Routes>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Dealer Manager routes - Protected by authentication and role */}
      <Route
        path="/dealer-manager/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['DEALER_MANAGER']}>
              <Routes>
                <Route path="dashboard" element={<DealerManagerDashboard />} />
                <Route path="inventory" element={<DealerManagerInventoryPage />} />
                <Route path="orders" element={<DealerManagerOrderManagementPage />} />
                <Route path="promotions" element={<PromotionPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="" element={<Navigate to="/dealer-manager/dashboard" replace />} />
              </Routes>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* EVM Staff routes - Protected by authentication and role */}
      <Route
        path="/evm-staff/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['EVM_STAFF']}>
              <Routes>
                <Route path="dashboard" element={<EvmStaffDashboard />} />
                <Route path="products" element={<ProductManagementPage />} />
                <Route path="orders" element={<DealerOrdersPage />} />
                <Route path="colors" element={<ColorManagementPage />} />
                <Route path="dealers" element={<DealersPage />} />
                <Route path="reports" element={<EvmStaffReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="" element={<Navigate to="/evm-staff/dashboard" replace />} />
              </Routes>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
