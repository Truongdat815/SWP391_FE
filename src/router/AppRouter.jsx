import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../features/public/home/HomePage';
import LoginPage from '../features/public/login/LoginPage';

// Admin routes
import AdminDashboard from '../features/admin/dashboard/DashboardPage';
import UserManagement from '../features/admin/accounts/UserManagementPage';
import BranchManagement from '../features/admin/branches/BranchManagementPage';

// Dealer Staff routes
import DealerStaffDashboard from '../features/dealerStaff/dashboard/DashboardPage';
import DealerStaffOrderManagementPage from '../features/dealerStaff/orders/OrderManagementPage';
import CustomerManagementPage from '../features/dealerStaff/customers/CustomerManagementPage';
import AppointmentsPage from '../features/dealerStaff/appointments/AppointmentsPage';
import QuotationPage from '../features/dealerStaff/quotation/QuotationPage';
import ProductsPage from '../features/dealerStaff/products/ProductsPage';
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
import EvmStaffInventoryPage from '../features/evmStaff/inventory/InventoryPage';
import DealerOrdersPage from '../features/evmStaff/orders/DealerOrdersPage';
import ColorManagementPage from '../features/evmStaff/colors/ColorManagementPage';

function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes - Truy cập trực tiếp không cần login */}
      <Route
        path="/admin/*"
        element={
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="accounts" element={<UserManagement />} />
            <Route path="branches" element={<BranchManagement />} />
            <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        }
      />

      {/* Dealer Staff routes - Truy cập trực tiếp */}
      <Route
        path="/dealer-staff/*"
        element={
          <Routes>
            <Route path="dashboard" element={<DealerStaffDashboard />} />
            <Route path="orders" element={<DealerStaffOrderManagementPage />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="quotation" element={<QuotationPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="" element={<Navigate to="/dealer-staff/dashboard" replace />} />
          </Routes>
        }
      />

      {/* Dealer Manager routes - Truy cập trực tiếp */}
      <Route
        path="/dealer-manager/*"
        element={
          <Routes>
            <Route path="dashboard" element={<DealerManagerDashboard />} />
            <Route path="inventory" element={<DealerManagerInventoryPage />} />
            <Route path="orders" element={<DealerManagerOrderManagementPage />} />
            <Route path="promotions" element={<PromotionPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="" element={<Navigate to="/dealer-manager/dashboard" replace />} />
          </Routes>
        }
      />

      {/* EVM Staff routes - Truy cập trực tiếp */}
      <Route
        path="/evm-staff/*"
        element={
          <Routes>
            <Route path="dashboard" element={<EvmStaffDashboard />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="inventory" element={<EvmStaffInventoryPage />} />
            <Route path="orders" element={<DealerOrdersPage />} />
            <Route path="colors" element={<ColorManagementPage />} />
            <Route path="" element={<Navigate to="/evm-staff/dashboard" replace />} />
          </Routes>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
