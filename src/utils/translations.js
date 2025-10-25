// Translation system cho dealer-manager settings
// Có thể mở rộng cho các role khác

export const dealerManagerTranslations = {
  vi: {
    // Header
    title: 'Cài đặt hệ thống',
    subtitle: 'Tùy chỉnh trải nghiệm làm việc theo nhu cầu của bạn',
    unsavedWarning: 'Có thay đổi chưa lưu',
    
    // Sidebar sections
    sections: {
      language: 'Ngôn ngữ & Định dạng',
      notifications: 'Thông báo',
      security: 'Lịch sử đăng nhập',
      performance: 'Hiệu suất',
      data: 'Dữ liệu',
    },
    
    // Language Section
    language: {
      title: 'Ngôn ngữ & Định dạng',
      subtitle: 'Cài đặt ngôn ngữ hiển thị và định dạng dữ liệu',
      displayLanguage: 'Ngôn ngữ hiển thị',
      timezone: 'Múi giờ',
      dateTimeFormatTitle: 'Định dạng ngày & giờ',
      dateFormat: 'Định dạng ngày',
      timeFormat: 'Định dạng giờ',
      numberCurrencyTitle: 'Định dạng số & tiền tệ',
      numberFormat: 'Định dạng số',
      currencyDisplay: 'Hiển thị tiền tệ',
      example: 'Ví dụ: 5.250.000 VNĐ',
      timezones: {
        hanoi: 'UTC+7 (Việt Nam - Hà Nội)',
        gmt: 'UTC+0 (GMT)',
        bangkok: 'UTC+7 (Bangkok)',
        singapore: 'UTC+8 (Singapore)',
      },
      dateFormats: {
        ddmmyyyy: 'DD/MM/YYYY (25/10/2025)',
        mmddyyyy: 'MM/DD/YYYY (10/25/2025)',
        yyyymmdd: 'YYYY-MM-DD (2025-10-25)',
      },
      timeFormats: {
        '24h': '24 giờ (14:30)',
        '12h': '12 giờ (2:30 PM)',
      },
      numberFormats: {
        vietnam: '1.000.000 (Việt Nam)',
        international: '1,000,000 (Quốc tế)',
      },
      currencyDisplays: {
        symbol: 'Ký hiệu (VNĐ)',
        code: 'Mã (VND)',
        name: 'Tên đầy đủ (Việt Nam Đồng)',
      },
    },
    
    // Notifications Section
    notifications: {
      title: 'Thông báo',
      subtitle: 'Quản lý cách bạn nhận thông báo từ hệ thống',
      channelsTitle: 'Kênh thông báo',
      emailTitle: 'Thông báo Email',
      emailDesc: 'Nhận thông báo qua email',
      systemTitle: 'Thông báo hệ thống',
      systemDesc: 'Hiển thị badge trên giao diện',
      browserTitle: 'Thông báo trình duyệt',
      browserDesc: 'Push notification desktop',
      soundTitle: 'Âm thanh thông báo',
      soundDesc: 'Phát âm thanh khi có thông báo mới',
      typesTitle: 'Loại thông báo nhận',
      newOrdersTitle: 'Đơn hàng mới',
      newOrdersDesc: 'Thông báo khi có đơn hàng mới từ nhân viên',
      lowStockTitle: 'Cảnh báo tồn kho',
      lowStockDesc: 'Khi hàng tồn kho xuống dưới mức an toàn',
      employeeActionsTitle: 'Hành động nhân viên',
      employeeActionsDesc: 'Thông báo các hành động quan trọng của nhân viên',
      dailyDigestTitle: 'Email tóm tắt hàng ngày',
      dailyDigestDesc: 'Nhận báo cáo tổng hợp cuối ngày',
      sendTime: 'Thời gian gửi',
    },
    
    // Security Section
    security: {
      title: 'Lịch sử đăng nhập',
      subtitle: 'Xem và quản lý các phiên đăng nhập của bạn',
      warningTitle: 'Bảo mật tài khoản',
      warningDesc: 'Nếu bạn thấy hoạt động đáng ngờ, hãy đăng xuất khỏi các thiết bị không tin cậy và đổi mật khẩu ngay.',
      changePassword: 'Đổi mật khẩu →',
      autoLogoutTitle: 'Tự động đăng xuất',
      autoLogoutDesc: 'Đăng xuất tự động khi không hoạt động',
      sessionTimeout: 'Thời gian chờ (phút)',
      devicesTitle: 'Thiết bị đã đăng nhập',
      activeStatus: 'Đang hoạt động',
      logoutAction: 'Đăng xuất',
      timeoutOptions: {
        '15': '15 phút',
        '30': '30 phút',
        '60': '1 giờ',
        '120': '2 giờ',
      },
    },
    
    // Performance Section
    performance: {
      title: 'Hiệu suất',
      subtitle: 'Tối ưu hóa tốc độ và hiệu suất hệ thống',
      interfaceTitle: 'Giao diện',
      animationsTitle: 'Hiệu ứng chuyển động',
      animationsDesc: 'Animations và transitions',
      autoLoadImagesTitle: 'Tự động tải hình ảnh',
      autoLoadImagesDesc: 'Hiển thị hình ảnh trong bảng',
      imageQuality: 'Chất lượng hình ảnh',
      imageQualityOptions: {
        high: 'Cao (Tốt nhất, chậm hơn)',
        medium: 'Trung bình (Cân bằng)',
        low: 'Thấp (Nhanh nhất)',
      },
      paginationTitle: 'Phân trang',
      itemsPerPage: 'Số bản ghi mỗi trang',
      itemsPerPageNote: 'Số lượng cao hơn có thể làm chậm trang',
      itemsOptions: {
        '10': '10 bản ghi',
        '25': '25 bản ghi',
        '50': '50 bản ghi',
        '100': '100 bản ghi (Có thể chậm)',
      },
      cacheTitle: 'Cache & Dữ liệu tạm',
      cacheDesc: 'Cache giúp tải trang nhanh hơn. Xóa cache nếu bạn gặp vấn đề với dữ liệu cũ hoặc lỗi hiển thị.',
      clearCache: 'Xóa cache',
      clearCacheConfirm: 'Xóa cache? Trang sẽ tải lại sau khi xóa.',
      cacheCleared: 'Đã xóa cache. Đang tải lại...',
    },
    
    // Data Section
    data: {
      title: 'Dữ liệu & Quyền riêng tư',
      subtitle: 'Quản lý dữ liệu cá nhân và quyền riêng tư của bạn',
      exportTitle: 'Xuất dữ liệu cá nhân',
      exportDesc: 'Tải xuất toàn bộ dữ liệu cá nhân của bạn theo quy định GDPR. File sẽ được gửi qua email trong vòng 48 giờ.',
      exportButton: 'Yêu cầu xuất dữ liệu',
      storageTitle: 'Lưu trữ dữ liệu',
      retentionPeriod: 'Thời gian lưu trữ lịch sử',
      retentionNote: 'Dữ liệu cũ hơn sẽ tự động xóa',
      retentionOptions: {
        '30': '30 ngày',
        '60': '60 ngày',
        '90': '90 ngày',
        '180': '6 tháng',
        '365': '1 năm',
      },
      autoBackupTitle: 'Sao lưu tự động',
      autoBackupDesc: 'Backup dữ liệu hàng tuần',
      deleteTitle: 'Xóa dữ liệu',
      clearHistoryTitle: 'Xóa lịch sử hoạt động',
      clearHistoryDesc: 'Xóa log hoạt động và lịch sử tìm kiếm',
      clearHistoryButton: 'Xóa lịch sử',
      deleteAccountTitle: 'Xóa tài khoản',
      deleteAccountDesc: 'Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu',
      deleteAccountButton: 'Xóa tài khoản',
      privacyTitle: '🔒 Quyền riêng tư của bạn',
      privacyRights: [
        'Bạn có quyền truy cập và tải xuất dữ liệu cá nhân',
        'Bạn có quyền yêu cầu chỉnh sửa thông tin không chính xác',
        'Bạn có quyền yêu cầu xóa dữ liệu cá nhân',
        'Dữ liệu của bạn được mã hóa và bảo mật theo GDPR',
      ],
    },
    
    // Buttons
    buttons: {
      reset: 'Khôi phục mặc định',
      cancel: 'Hủy',
      save: 'Lưu cài đặt',
    },
    
    // Alerts
    alerts: {
      saveSuccess: 'Cài đặt đã được lưu thành công!',
      saveError: 'Có lỗi khi lưu cài đặt. Vui lòng thử lại!',
      resetConfirm: 'Bạn có chắc muốn reset về cài đặt mặc định?',
      exportData: 'Đang xuất dữ liệu của bạn...',
      clearHistoryConfirm: 'Xóa lịch sử hoạt động? Hành động này không thể hoàn tác.',
      historyCleared: 'Đã xóa lịch sử hoạt động',
      deleteAccountContact: 'Vui lòng liên hệ admin để xóa tài khoản',
      logoutDeviceConfirm: 'Đăng xuất khỏi thiết bị này?',
      changePasswordFeature: 'Chức năng đổi mật khẩu',
    },
  },
  en: {
    // Header
    title: 'System Settings',
    subtitle: 'Customize your work experience to your needs',
    unsavedWarning: 'Unsaved changes',
    
    // Sidebar sections
    sections: {
      language: 'Language & Format',
      notifications: 'Notifications',
      security: 'Login History',
      performance: 'Performance',
      data: 'Data',
    },
    
    // Language Section
    language: {
      title: 'Language & Format',
      subtitle: 'Configure display language and data formatting',
      displayLanguage: 'Display Language',
      timezone: 'Timezone',
      dateTimeFormatTitle: 'Date & Time Format',
      dateFormat: 'Date Format',
      timeFormat: 'Time Format',
      numberCurrencyTitle: 'Number & Currency Format',
      numberFormat: 'Number Format',
      currencyDisplay: 'Currency Display',
      example: 'Example: 5,250,000 VND',
      timezones: {
        hanoi: 'UTC+7 (Vietnam - Hanoi)',
        gmt: 'UTC+0 (GMT)',
        bangkok: 'UTC+7 (Bangkok)',
        singapore: 'UTC+8 (Singapore)',
      },
      dateFormats: {
        ddmmyyyy: 'DD/MM/YYYY (25/10/2025)',
        mmddyyyy: 'MM/DD/YYYY (10/25/2025)',
        yyyymmdd: 'YYYY-MM-DD (2025-10-25)',
      },
      timeFormats: {
        '24h': '24 hours (14:30)',
        '12h': '12 hours (2:30 PM)',
      },
      numberFormats: {
        vietnam: '1.000.000 (Vietnam)',
        international: '1,000,000 (International)',
      },
      currencyDisplays: {
        symbol: 'Symbol (VNĐ)',
        code: 'Code (VND)',
        name: 'Full name (Vietnam Dong)',
      },
    },
    
    // Notifications Section
    notifications: {
      title: 'Notifications',
      subtitle: 'Manage how you receive notifications from the system',
      channelsTitle: 'Notification Channels',
      emailTitle: 'Email Notifications',
      emailDesc: 'Receive notifications via email',
      systemTitle: 'System Notifications',
      systemDesc: 'Display badge on interface',
      browserTitle: 'Browser Notifications',
      browserDesc: 'Desktop push notifications',
      soundTitle: 'Sound Notifications',
      soundDesc: 'Play sound when new notification arrives',
      typesTitle: 'Notification Types',
      newOrdersTitle: 'New Orders',
      newOrdersDesc: 'Notify when new orders from staff',
      lowStockTitle: 'Low Stock Alert',
      lowStockDesc: 'When inventory falls below safety level',
      employeeActionsTitle: 'Employee Actions',
      employeeActionsDesc: 'Notify important employee actions',
      dailyDigestTitle: 'Daily Email Digest',
      dailyDigestDesc: 'Receive end-of-day summary report',
      sendTime: 'Send Time',
    },
    
    // Security Section
    security: {
      title: 'Login History',
      subtitle: 'View and manage your login sessions',
      warningTitle: 'Account Security',
      warningDesc: 'If you see suspicious activity, logout from untrusted devices and change your password immediately.',
      changePassword: 'Change Password →',
      autoLogoutTitle: 'Auto Logout',
      autoLogoutDesc: 'Automatically logout when inactive',
      sessionTimeout: 'Timeout Duration (minutes)',
      devicesTitle: 'Logged-in Devices',
      activeStatus: 'Active',
      logoutAction: 'Logout',
      timeoutOptions: {
        '15': '15 minutes',
        '30': '30 minutes',
        '60': '1 hour',
        '120': '2 hours',
      },
    },
    
    // Performance Section
    performance: {
      title: 'Performance',
      subtitle: 'Optimize speed and system performance',
      interfaceTitle: 'Interface',
      animationsTitle: 'Animations',
      animationsDesc: 'Animations and transitions',
      autoLoadImagesTitle: 'Auto Load Images',
      autoLoadImagesDesc: 'Display images in tables',
      imageQuality: 'Image Quality',
      imageQualityOptions: {
        high: 'High (Best quality, slower)',
        medium: 'Medium (Balanced)',
        low: 'Low (Fastest)',
      },
      paginationTitle: 'Pagination',
      itemsPerPage: 'Items per Page',
      itemsPerPageNote: 'Higher numbers may slow down the page',
      itemsOptions: {
        '10': '10 items',
        '25': '25 items',
        '50': '50 items',
        '100': '100 items (May be slow)',
      },
      cacheTitle: 'Cache & Temporary Data',
      cacheDesc: 'Cache helps pages load faster. Clear cache if you encounter issues with old data or display errors.',
      clearCache: 'Clear Cache',
      clearCacheConfirm: 'Clear cache? Page will reload after clearing.',
      cacheCleared: 'Cache cleared. Reloading...',
    },
    
    // Data Section
    data: {
      title: 'Data & Privacy',
      subtitle: 'Manage your personal data and privacy',
      exportTitle: 'Export Personal Data',
      exportDesc: 'Download all your personal data in compliance with GDPR. File will be sent via email within 48 hours.',
      exportButton: 'Request Data Export',
      storageTitle: 'Data Storage',
      retentionPeriod: 'History Retention Period',
      retentionNote: 'Older data will be automatically deleted',
      retentionOptions: {
        '30': '30 days',
        '60': '60 days',
        '90': '90 days',
        '180': '6 months',
        '365': '1 year',
      },
      autoBackupTitle: 'Auto Backup',
      autoBackupDesc: 'Weekly data backup',
      deleteTitle: 'Delete Data',
      clearHistoryTitle: 'Clear Activity History',
      clearHistoryDesc: 'Delete activity logs and search history',
      clearHistoryButton: 'Clear History',
      deleteAccountTitle: 'Delete Account',
      deleteAccountDesc: 'Permanently delete account and all data',
      deleteAccountButton: 'Delete Account',
      privacyTitle: '🔒 Your Privacy Rights',
      privacyRights: [
        'You have the right to access and download your personal data',
        'You have the right to request correction of inaccurate information',
        'You have the right to request deletion of personal data',
        'Your data is encrypted and secured according to GDPR',
      ],
    },
    
    // Buttons
    buttons: {
      reset: 'Reset to Default',
      cancel: 'Cancel',
      save: 'Save Settings',
    },
    
    // Alerts
    alerts: {
      saveSuccess: 'Settings saved successfully!',
      saveError: 'Error saving settings. Please try again!',
      resetConfirm: 'Are you sure you want to reset to default settings?',
      exportData: 'Exporting your data...',
      clearHistoryConfirm: 'Clear activity history? This action cannot be undone.',
      historyCleared: 'Activity history cleared',
      deleteAccountContact: 'Please contact admin to delete account',
      logoutDeviceConfirm: 'Logout from this device?',
      changePasswordFeature: 'Change password feature',
    },
  },
};

// Export cho các role khác (dùng chung cùng translations)
export const adminTranslations = dealerManagerTranslations;
export const dealerStaffTranslations = dealerManagerTranslations;
export const evmStaffTranslations = dealerManagerTranslations;

// Export chung cho tất cả settings pages
export const settingsTranslations = dealerManagerTranslations;
