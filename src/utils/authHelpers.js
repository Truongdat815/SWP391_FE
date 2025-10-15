// Helper functions for authentication and user session

export const getStaffId = () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            return user.userId;
        } catch (error) {
            console.error('Error parsing user info:', error);
        }
    }
    return null;
};

export const getStoreId = () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            return user.storeId;
        } catch (error) {
            console.error('Error parsing user info:', error);
        }
    }
    return null;
};

export const getUserRole = () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            const roleMapping = {
                1: 'admin',
                2: 'dealer-manager',
                3: 'dealer-staff',
                4: 'evm-staff'
            };
            return roleMapping[user.roleId] || user.roleName?.toLowerCase();
        } catch (error) {
            console.error('Error parsing user info:', error);
        }
    }
    return null;
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    return !!(token && userInfo);
};

export const getCurrentUser = () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
        try {
            return JSON.parse(userInfo);
        } catch (error) {
            console.error('Error parsing user info:', error);
        }
    }
    return null;
};