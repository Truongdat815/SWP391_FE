import { useState } from 'react';

function TestDriveSchedule({ onBack }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      phone: '0901234567',
      vehicleModel: 'Electra Ascent',
      time: '09:00',
      status: 'confirmed',
      notes: 'Khách hàng quan tâm đến tính năng lái tự động'
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      phone: '0987654321',
      vehicleModel: 'Electra CityLink',
      time: '14:30',
      status: 'pending',
      notes: 'Cần tư vấn về chính sách bảo hành'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    phone: '',
    vehicleModel: '',
    date: '',
    time: '',
    notes: ''
  });

  const vehicleModels = [
    'Electra Ascent',
    'Electra CityLink',
    'Electra GrandTour',
    'Electra Micro',
    'Electra Summit',
    'Electra Velocity',
    'Electra UrbanPulse',
    'Electra Voyager'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const appointment = {
      id: Date.now(),
      ...newAppointment,
      status: 'pending'
    };
    setAppointments([...appointments, appointment]);
    setNewAppointment({
      customerName: '',
      phone: '',
      vehicleModel: '',
      date: '',
      time: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn lái thử</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Thêm lịch hẹn
            </button>
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
          </div>
        </div>

        {/* Calendar Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Add Appointment Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm lịch hẹn mới</h3>
            <form onSubmit={handleAddAppointment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng *</label>
                <input
                  type="text"
                  name="customerName"
                  value={newAppointment.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={newAppointment.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mẫu xe *</label>
                <select
                  name="vehicleModel"
                  value={newAppointment.vehicleModel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn mẫu xe</option>
                  {vehicleModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hẹn *</label>
                <input
                  type="date"
                  name="date"
                  value={newAppointment.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ hẹn *</label>
                <select
                  name="time"
                  value={newAppointment.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn giờ</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <input
                  type="text"
                  name="notes"
                  value={newAppointment.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Thêm lịch hẹn
                  </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách lịch hẹn</h3>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Chưa có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{appointment.customerName}</h4>
                          <p className="text-sm text-gray-600">{appointment.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.vehicleModel}</p>
                          <p className="text-sm text-gray-600">{appointment.time}</p>
                        </div>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestDriveSchedule;
