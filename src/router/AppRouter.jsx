import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../features/public/home/HomePage';
import LoginPage from '../features/public/login/LoginPage';

// Admin routes
import AdminDashboard from '../features/admin/dashboard/DashboardPage';
import UserManagement from '../features/admin/accounts/UserManagementPage';
import BranchManagement from '../features/admin/branches/BranchManagementPage';

// Dealer Staff routes
import DealerStaffDashboard from '../features/dealerStaff/dashboard/DashboardPage';

// Dealer Manager routes
import DealerManagerDashboard from '../features/dealerManager/dashboard/DashboardPage';

// EVM Staff routes
import EvmStaffDashboard from '../features/evmStaff/dashboard/DashboardPage';

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
