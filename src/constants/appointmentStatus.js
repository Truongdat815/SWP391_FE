// Map status enum từ backend sang label tiếng Việt và className cho badge
export const STATUS_MAP = {
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "bg-green-200 text-green-700"
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    className: "bg-yellow-200 text-yellow-700"
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-blue-200 text-blue-700"
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-200 text-red-700"
  },
  NO_SHOW: {
    label: "Không đến",
    className: "bg-gray-200 text-gray-600"
  },
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-orange-200 text-orange-700"
  }
};


