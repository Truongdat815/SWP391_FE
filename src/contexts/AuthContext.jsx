import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, refreshTokenThunk } from '../store/slices/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, tokens, status, error } = useSelector(state => state.auth);

    // Handle logout
    const handleLogout = () => {
        dispatch(logout());
    };

    // Get user role for route protection
    const getUserRole = () => {
        if (!user) return null;
        
        console.log('getUserRole - user data:', user);
        console.log('getUserRole - user.roleId:', user.roleId);
        console.log('getUserRole - user.roleName:', user.roleName);
        
        // Try roleId mapping first (corrected based on actual database)
        const roleMapping = {
            1: 'admin',            // Quản trị viên
            2: 'dealer-staff',     // Nhân viên cửa hàng
            3: 'dealer-manager',   // Quản lý cửa hàng
            4: 'evm-staff'         // Nhân viên hãng xe
        };
        
        if (user.roleId && roleMapping[user.roleId]) {
            const mappedRole = roleMapping[user.roleId];
            console.log('getUserRole - mapped by roleId:', mappedRole);
            return mappedRole;
        }
        
        // Fallback to roleName (handle Vietnamese names from backend)
        const roleName = user.roleName?.toLowerCase();
        console.log('getUserRole - roleName lowercase:', roleName);
        
        if (roleName) {
            // Normalize role names (support both English and Vietnamese)
            if (roleName.includes('quản trị viên') || roleName.includes('admin')) {
                console.log('getUserRole - matched admin');
                return 'admin';
            }
            if (roleName.includes('nhân viên cửa hàng') || roleName.includes('dealer staff')) {
                console.log('getUserRole - matched dealer staff');
                return 'dealer-staff';
            }
            if (roleName.includes('quản lý cửa hàng') || roleName.includes('dealer manager')) {
                console.log('getUserRole - matched dealer manager');
                return 'dealer-manager';
            }
            if (roleName.includes('nhân viên hãng xe') || roleName.includes('evm staff')) {
                console.log('getUserRole - matched evm staff');
                return 'evm-staff';
            }
        }
        
        console.log('getUserRole - fallback to roleName:', roleName);
        return roleName;
    };

    // Check if user has permission for a role
    const hasRole = (requiredRole) => {
        const userRole = getUserRole();
        return userRole === requiredRole;
    };

    // Get route based on user role
    const getDefaultRoute = () => {
        const userRole = getUserRole();
        const roleRoutes = {
            'admin': '/admin',
            'dealer-manager': '/dealer-manager',
            'dealer-staff': '/dealer-staff', 
            'evm-staff': '/evm-staff'
        };
        return roleRoutes[userRole] || '/signin';
    };

    const value = {
        isAuthenticated,
        user,
        tokens,
        status,
        error,
        logout: handleLogout,
        getUserRole,
        hasRole,
        getDefaultRoute,
        // Helper functions for order creation
        getStaffId: () => user?.userId,
        getStoreId: () => user?.storeId
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};