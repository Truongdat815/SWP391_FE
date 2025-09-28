import React from 'react'
import vf5Image from '../assets/images/vf5-color-4.webp'
import vf6Image from '../assets/images/vf6.webp'
import vf7Image from '../assets/images/vf7-uu-diem-3.webp'
import vf8Image from '../assets/images/vf8.webp'
import vf9Image from '../assets/images/vf9.webp'
import vf3Image from '../assets/images/vf3.jpg'

const SimpleAccessories = () => {
  const accessories = [
    {
      id: 1,
      name: "Thảm lót sàn VinFast",
      image: vf5Image,
      price: "1.500.000 VNĐ",
      description: "Thảm lót sàn cao cấp, chống thấm nước và dễ vệ sinh"
    },
    {
      id: 2,
      name: "Ốp viền cửa sổ Chrome",
      image: vf6Image,
      price: "2.800.000 VNĐ", 
      description: "Ốp viền chrome sang trọng, tăng tính thẩm mỹ cho xe"
    },
    {
      id: 3,
      name: "Bọc ghế da cao cấp",
      image: vf7Image,
      price: "8.500.000 VNĐ",
      description: "Bọc ghế da thật cao cấp, êm ái và sang trọng"
    },
    {
      id: 4,
      name: "Camera hành trình",
      image: vf8Image,
      price: "3.200.000 VNĐ",
      description: "Camera ghi hình Full HD, góc quay rộng 170 độ"
    },
    {
      id: 5,
      name: "Màn hình Android",
      image: vf9Image,
      price: "12.000.000 VNĐ",
      description: "Màn hình cảm ứng 10.25 inch với Android Auto"
    },
    {
      id: 6,
      name: "Bộ cản va trước/sau",
      image: vf3Image,
      price: "4.500.000 VNĐ",
      description: "Cản va thể thao, tăng tính an toàn và thẩm mỹ"
    }
  ]

  return (
    <section className="py-16 bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Phụ kiện xe VinFast
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập phụ kiện chính hãng VinFast để nâng cao trải nghiệm lái xe của bạn
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img 
                  src={accessory.image} 
                  alt={accessory.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {accessory.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {accessory.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    {accessory.price}
                  </span>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-transparent border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium">
            Xem tất cả phụ kiện
          </button>
        </div>
      </div>
    </section>
  )
}

export default SimpleAccessories