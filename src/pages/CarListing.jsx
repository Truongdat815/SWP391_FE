import { Link } from 'react-router-dom'
import vf3 from "../assets/images/vf3.jpg"
import vf5 from "../assets/images/vf5-color-4.webp"
import vf6 from "../assets/images/vf6.webp"
import vf7 from "../assets/images/vf7-uu-diem-3.webp"
import vf8 from "../assets/images/vf8.webp"
import vf9 from "../assets/images/vf9.webp"

function CarListing() {
  const cars = [
    {
      id: 'vf3',
      name: 'VinFast VF3',
      image: vf3,
      price: '299.000.000',
      description: 'Xe điện nhỏ gọn, linh hoạt cho thành phố hiện đại',
      specs: ['Pin 42kWh', 'Quãng đường 200km', 'Sạc nhanh 30 phút']
    },
    {
      id: 'vf5',
      name: 'VinFast VF5',
      image: vf5,
      price: '529.000.000',
      description: 'Crossover thông minh với công nghệ tiên tiến',
      specs: ['Pin 57kWh', 'Quãng đường 300km', 'Sạc nhanh 25 phút']
    },
    {
      id: 'vf6',
      name: 'VinFast VF6',
      image: vf6,
      price: '765.000.000',
      description: 'SUV crossover linh hoạt cho gia đình trẻ',
      specs: ['Pin 64kWh', 'Quãng đường 350km', 'Sạc nhanh 22 phút']
    },
    {
      id: 'vf7',
      name: 'VinFast VF7',
      image: vf7,
      price: '999.000.000',
      description: 'SUV cao cấp với thiết kế hiện đại',
      specs: ['Pin 75kWh', 'Quãng đường 450km', 'Sạc nhanh 20 phút']
    },
    {
      id: 'vf8',
      name: 'VinFast VF8',
      image: vf8,
      price: '1.199.000.000',
      description: 'SUV điện tầm trung đa dụng cho mọi hành trình',
      specs: ['Pin 82kWh', 'Quãng đường 500km', 'Sạc nhanh 18 phút']
    },
    {
      id: 'vf9',
      name: 'VinFast VF9',
      image: vf9,
      price: '1.599.000.000',
      description: 'SUV flagship sang trọng, 3 hàng ghế rộng rãi',
      specs: ['Pin 92kWh', 'Quãng đường 550km', 'Sạc nhanh 15 phút']
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Dòng xe VinFast
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Khám phá bộ sưu tập xe điện thông minh với công nghệ tiên tiến và thiết kế hiện đại
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
              Gọi 1900 23 23 89
            </a>
            <a 
              href="mailto:support.vn@vinfastauto.com"
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
