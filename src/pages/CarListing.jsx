import { Link } from 'react-router-dom'
import electraAscent from "../assets/images/electra ascent.png"
import electraCitylink from "../assets/images/electra citylink poster.png"
import electraGrandtour from "../assets/images/electra grandtour.png"
import electraMicro from "../assets/images/electra micro.png"
import electraSummit from "../assets/images/electra summit.png"
import electraVelocity from "../assets/images/electra velocity.png"

function CarListing() {
  const cars = [
    {
      id: 'electra-ascent',
      name: 'Electra Ascent',
      image: electraAscent,
      price: '299.000.000',
      description: 'Xe điện đô thị thông minh, thiết kế nhỏ gọn và hiệu quả',
      specs: ['Pin 45kWh', 'Quãng đường 250km', 'Sạc nhanh 20 phút']
    },
    {
      id: 'electra-citylink',
      name: 'Electra CityLink',
      image: electraCitylink,
      price: '529.000.000',
      description: 'Crossover điện cao cấp với công nghệ AI thông minh',
      specs: ['Pin 60kWh', 'Quãng đường 350km', 'Sạc nhanh 18 phút']
    },
    {
      id: 'electra-grandtour',
      name: 'Electra GrandTour',
      image: electraGrandtour,
      price: '765.000.000',
      description: 'SUV điện cao cấp cho gia đình hiện đại',
      specs: ['Pin 70kWh', 'Quãng đường 400km', 'Sạc nhanh 16 phút']
    },
    {
      id: 'electra-micro',
      name: 'Electra Micro',
      image: electraMicro,
      price: '999.000.000',
      description: 'SUV điện cao cấp với thiết kế tương lai',
      specs: ['Pin 80kWh', 'Quãng đường 500km', 'Sạc nhanh 15 phút']
    },
    {
      id: 'electra-summit',
      name: 'Electra Summit',
      image: electraSummit,
      price: '1.199.000.000',
      description: 'SUV điện tầm trung, hiệu suất cao cho mọi hành trình',
      specs: ['Pin 85kWh', 'Quãng đường 550km', 'Sạc nhanh 14 phút']
    },
    {
      id: 'electra-velocity',
      name: 'Electra Velocity',
      image: electraVelocity,
      price: '1.599.000.000',
      description: 'SUV flagship điện sang trọng, 3 hàng ghế cao cấp',
      specs: ['Pin 100kWh', 'Quãng đường 600km', 'Sạc nhanh 12 phút']
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Dòng xe Electra
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Khám phá bộ sưu tập xe điện thông minh với công nghệ AI tiên tiến và thiết kế tương lai
          </p>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Car Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={car.image} 
                  alt={car.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Car Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{car.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{car.description}</p>
                
                {/* Specs */}
                <div className="space-y-2 mb-6">
                  {car.specs.map((spec, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {spec}
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Giá từ</p>
                    <p className="text-2xl font-bold text-emerald-600">{car.price} VNĐ</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link 
                    to={`/car/${car.id}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Xem chi tiết
                  </Link>
                  <Link 
                    to={`/car/${car.id}`}
                    className="px-4 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold transition-colors duration-200 text-center"
                  >
                    Liên hệ tư vấn
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Cần tư vấn thêm?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Liên hệ với chúng tôi để được tư vấn chi tiết và đặt lịch lái thử
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:1900232389"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Gọi 1900 444 444
            </a>
            <a 
              href="mailto:support@electra.com"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Gửi email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarListing
