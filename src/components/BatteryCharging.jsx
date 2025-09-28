import React from 'react'

const BatteryCharging = () => {
  console.log('BatteryCharging component is rendering');
  const batteryFeatures = [
    {
      id: 1,
      icon: "🔋",
      title: "Pin LFP an toàn",
      description: "Công nghệ pin Lithium Iron Phosphate (LFP) với độ bền cao và an toàn tuyệt đối"
    },
    {
      id: 2, 
      icon: "⚡",
      title: "Sạc nhanh DC",
      description: "Sạc nhanh DC từ 10-70% chỉ trong 31 phút với công suất sạc lên đến 150kW"
    },
    {
      id: 3,
      icon: "🏠",
      title: "Sạc tại nhà",
      description: "Dễ dàng sạc xe tại nhà với bộ sạc AC 7.4kW hoặc 11kW, thuận tiện mọi lúc"
    },
    {
      id: 4,
      icon: "📱",
      title: "Ứng dụng VinFast",
      description: "Quản lý và điều khiển sạc xe thông minh qua ứng dụng VinFast trên điện thoại"
    }
  ]

  const chargingStations = [
    {
      id: 1,
      name: "Green SM Mall",
      address: "TTTM Green SM, 576 Nguyễn Duy Trinh, Q.2, TP.HCM",
      type: "DC Fast Charging",
      power: "150kW",
      status: "Hoạt động",
      available: "2/4 trạm"
    },
    {
      id: 2,
      name: "Vinhomes Central Park",
      address: "Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, Q.Bình Thạnh, TP.HCM", 
      type: "AC Charging",
      power: "22kW",
      status: "Hoạt động",
      available: "6/8 trạm"
    },
    {
      id: 3,
      name: "AEON Mall Tân Phú",
      address: "AEON Mall Tân Phú, 30 Bờ Bao Tân Thắng, Q.Tân Phú, TP.HCM",
      type: "DC Fast Charging", 
      power: "120kW",
      status: "Hoạt động",
      available: "3/4 trạm"
    }
  ]

  return (
    <section className="py-16 bg-white w-full">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pin và trạm sạc
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hệ sinh thái pin và sạc toàn diện, mang đến trải nghiệm di chuyển bền vững và tiện lợi
          </p>
        </div>

        {/* Battery Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Công nghệ pin tiên tiến
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {batteryFeatures.map((feature) => (
              <div key={feature.id} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Battery Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-16 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500km</div>
              <div className="text-blue-100">Quãng đường di chuyển tối đa</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">31 phút</div>
              <div className="text-blue-100">Sạc nhanh DC 10-70%</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10 năm</div>
              <div className="text-blue-100">Bảo hành pin</div>
            </div>
          </div>
        </div>

        {/* Charging Stations */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Trạm sạc gần đây
            </h3>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Xem tất cả trạm sạc →
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {chargingStations.map((station) => (
              <div key={station.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {station.name}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    station.status === 'Hoạt động' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {station.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {station.address}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Loại sạc:</span>
                  <span className="text-sm font-medium text-gray-900">{station.type}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Công suất:</span>
                  <span className="text-sm font-medium text-gray-900">{station.power}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Trạm khả dụng:</span>
                  <span className="text-sm font-medium text-green-600">{station.available}</span>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                  Chỉ đường
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tải ứng dụng VinFast
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Quản lý xe điện, tìm trạm sạc và thanh toán dễ dàng với ứng dụng VinFast
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center">
              <span className="mr-2">📱</span>
              Tải trên App Store
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center">
              <span className="mr-2">🤖</span>
              Tải trên Google Play
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BatteryCharging