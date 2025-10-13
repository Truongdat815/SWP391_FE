import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosClient from '@/services/axiosClient'

function CarListing() {
  const [models, setModels] = useState([])

  useEffect(() => {
    axiosClient.get('/api/models/all')
      .then(res => setModels(res.data.data))
      .catch(err => console.error('Lỗi lấy danh sách model:', err))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Dòng xe <span className="text-green-600">Electra</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Khám phá bộ sưu tập xe điện thông minh với công nghệ AI tiên tiến và thiết kế tương lai
          </p>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {models.map((model) => (
            <div key={model.modelId} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Car Image */}
              <div className="relative overflow-hidden">
                {/* API chưa trả ảnh, giữ placeholder gradient */}
                <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Car Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{model.modelName}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{model.modelYear ? `Model ${model.modelYear}` : 'Mẫu xe điện'}</p>
                
                {/* Specs */}
                <div className="space-y-2 mb-6">
                  {[`Pin ${model.batteryCapacity || 'N/A'}kWh`, `Quãng đường ${model.range || 'N/A'}km`, `${model.powerHp || 'N/A'} HP`].map((spec, index) => (
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
                    <p className="text-2xl font-bold text-emerald-600">{model.price ? `${model.price.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link 
                    to={`/car/${model.modelId}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Xem chi tiết
                  </Link>
                  <Link 
                    to={`/car/${model.modelId}`}
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
