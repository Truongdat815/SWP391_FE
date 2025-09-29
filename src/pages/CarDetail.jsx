import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function CarDetail() {
  const { model } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Mock data for Electra vehicles
  // const vehicles = {
  //   'electra-ascent': {
  //     name: 'Electra Ascent',
  //     image: '/src/assets/images/electra ascent.png',
  //     colors: [
  //       { name: 'Đỏ Cherry', code: '#8B0000' },
  //       { name: 'Trắng Ngọc Trai', code: '#F8F8FF' },
  //       { name: 'Xanh Dương', code: '#1E40AF' }
  //     ],
  //     variants: [
  //       {
  //         name: 'Electra Ascent Base',
  //         price: '240.000.000',
  //         features: ['Động cơ điện 45 kW', 'Pin LFP 42 kWh', 'Tốc độ tối đa 110 km/h', 'Phạm vi di chuyển 220 km']
  //       },
  //       {
  //         name: 'Electra Ascent Plus',
  //         price: '280.000.000',
  //         features: ['Động cơ điện 45 kW', 'Pin LFP 42 kWh', 'Tốc độ tối đa 110 km/h', 'Phạm vi di chuyển 220 km', 'Camera 360° AI']
  //       }
  //     ],
  //     specifications: {
  //       'Kích thước (DxRxC)': '3.190 x 1.679 x 1.622 mm',
  //       'Trọng lượng': '1.114 kg',
  //       'Động cơ': 'Điện 41.9 kW',
  //       'Pin': 'LFP 18.64 kWh',
  //       'Phạm vi hoạt động': '210 km',
  //       'Tốc độ tối đa': '100 km/h',
  //       'Thời gian sạc': '5.5 giờ (AC)',
  //       'Chỗ ngồi': '4 chỗ'
  //     }
  //   },
  //   'electra-citylink': {
  //     name: 'Electra CityLink',
  //     image: '/src/assets/images/electra citylink poster.png',
  //     colors: [
  //       { name: 'Xanh Dương', code: '#1E40AF' },
  //       { name: 'Trắng Ngọc Trai', code: '#F8F8FF' },
  //       { name: 'Xám Titan', code: '#6B7280' }
  //     ],
  //     variants: [
  //       {
  //         name: 'Electra CityLink Base',
  //         price: '458.000.000',
  //         features: ['Động cơ điện 110 kW', 'Pin LFP 57 kWh', 'Tốc độ tối đa 150 km/h', 'Phạm vi di chuyển 320 km']
  //       },
  //       {
  //         name: 'Electra CityLink Plus',
  //         price: '508.000.000',
  //         features: ['Động cơ điện 110 kW', 'Pin LFP 57 kWh', 'Tốc độ tối đa 150 km/h', 'Phạm vi di chuyển 320 km', 'Màn hình AI 12 inch']
  //       }
  //     ],
  //     specifications: {
  //       'Kích thước (DxRxC)': '4.090 x 1.756 x 1.611 mm',
  //       'Trọng lượng': '1.610 kg',
  //       'Động cơ': 'Điện 100 kW',
  //       'Pin': 'LFP 37.23 kWh',
  //       'Phạm vi hoạt động': '285 km',
  //       'Tốc độ tối đa': '140 km/h',
  //       'Thời gian sạc': '7 giờ (AC)',
  //       'Chỗ ngồi': '5 chỗ'
  //     }
  //   },
  //   'electra-grandtour': {
  //     name: 'Electra GrandTour',
  //     image: '/src/assets/images/electra grandtour.png',
  //     colors: [
  //       { name: 'Xanh Dương', code: '#1E40AF' },
  //       { name: 'Đen Huyền Bí', code: '#1F2937' },
  //       { name: 'Trắng Ngọc Trai', code: '#F8F8FF' }
  //     ],
  //     variants: [
  //       {
  //         name: 'Electra GrandTour Base',
  //         price: '765.000.000',
  //         features: ['Động cơ điện 140 kW', 'Pin LFP 64 kWh', 'Tốc độ tối đa 170 km/h', 'Phạm vi di chuyển 370 km']
  //       }
  //     ],
  //     specifications: {
  //       'Kích thước (DxRxC)': '4.238 x 1.820 x 1.594 mm',
  //       'Trọng lượng': '1.750 kg',
  //       'Động cơ': 'Điện 130 kW',
  //       'Pin': 'LFP 59.6 kWh',
  //       'Phạm vi hoạt động': '445 km',
  //       'Tốc độ tối đa': '160 km/h',
  //       'Thời gian sạc': '8.5 giờ (AC)',
  //       'Chỗ ngồi': '5 chỗ'
  //     }
  //   }
  // };

  // const vehicle = vehicles[model];

  const [models, setModels] = useState([])

  useEffect(() => {
    const fetchModels = async () => {
      const response = await fetch('http://localhost:3000/models')
      const data = await response.json()
      setModels(data)
    }
    fetchModels()
  }, [])
  useEffect(() => {
    console.log(models)
  }, [models])

  return (
    <div>
      <h1>Car Detail</h1>
    </div>
  )

  // if (!vehicle) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
  //       <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
  //         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
  //           </svg>
  //         </div>
  //         <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy xe</h1>
  //         <Link to="/cars" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
  //           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
  //           </svg>
  //           Quay lại danh sách xe
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  // const currentVariant = vehicle.variants[selectedVariant];
  // const currentColor = vehicle.colors[selectedColor];

  // const handleContactFormChange = (e) => {
  //   setContactForm({
  //     ...contactForm,
  //     [e.target.name]: e.target.value
  //   });
  // };

  // const handleContactSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
    
  //   // Simulate API call
  //   setTimeout(() => {
  //     setSubmitMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
  //     setContactForm({ name: '', phone: '', email: '' });
  //     setIsSubmitting(false);
      
  //     // Clear message after 5 seconds
  //     setTimeout(() => setSubmitMessage(''), 5000);
  //   }, 1000);
  // };

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
  //     {/* Breadcrumb */}
  //     <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
  //       <div className="max-w-7xl mx-auto px-6 py-4">
  //         <nav className="flex" aria-label="Breadcrumb">
  //           <ol className="inline-flex items-center space-x-1 md:space-x-3">
  //             <li className="inline-flex items-center">
  //               <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
  //                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
  //                   <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
  //                 </svg>
  //                 Trang chủ
  //               </Link>
  //             </li>
  //             <li>
  //               <div className="flex items-center">
  //                 <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
  //                   <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
  //                 </svg>
  //                 <Link to="/cars" className="ml-1 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors md:ml-2">
  //                   Ô tô
  //                 </Link>
  //               </div>
  //             </li>
  //             <li aria-current="page">
  //               <div className="flex items-center">
  //                 <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
  //                   <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
  //                 </svg>
  //                 <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{vehicle.name}</span>
  //               </div>
  //             </li>
  //           </ol>
  //         </nav>
  //       </div>
  //     </div>

  //     {/* Hero Section */}
  //     <div className="relative">
  //       <div className="max-w-7xl mx-auto px-6 py-12">
  //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  //           {/* Image Section */}
  //           <div className="order-2 lg:order-1">
  //             <div className="relative group">
  //               <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
  //               <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
  //                 <img 
  //                   src={vehicle.image}
  //                   alt={vehicle.name}
  //                   className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
  //                 />
  //               </div>
  //             </div>
  //           </div>

  //           {/* Info Section */}
  //           <div className="order-1 lg:order-2 space-y-8">
  //             <div>
  //               <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-4">
  //                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
  //                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
  //                 </svg>
  //                 Xe điện <span className="text-green-600">Electra</span>
  //               </div>
  //               <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">{vehicle.name}</h1>
  //               <p className="text-2xl text-emerald-600 font-bold">
  //                 Từ <span className="text-3xl">{currentVariant.price}</span> VNĐ
  //               </p>
  //             </div>

  //             {/* Color Selection */}
  //             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
  //               <h3 className="text-lg font-bold text-gray-900 mb-4">Chọn màu sắc</h3>
  //               <div className="flex gap-4">
  //                 {vehicle.colors.map((color, index) => (
  //                   <button
  //                     key={index}
  //                     onClick={() => setSelectedColor(index)}
  //                     className={`w-14 h-14 rounded-full border-4 transition-all duration-300 ${
  //                       selectedColor === index 
  //                         ? 'border-emerald-500 scale-110 shadow-lg ring-4 ring-emerald-200' 
  //                         : 'border-gray-300 hover:border-gray-400 hover:scale-105'
  //                     }`}
  //                     style={{ backgroundColor: color.code }}
  //                     title={color.name}
  //                   />
  //                 ))}
  //               </div>
  //               <p className="mt-4 text-gray-600">
  //                 Màu đã chọn: <span className="font-bold text-gray-900">{currentColor.name}</span>
  //               </p>
  //             </div>

  //             {/* Variant Selection */}
  //             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
  //               <h3 className="text-lg font-bold text-gray-900 mb-4">Chọn phiên bản</h3>
  //               <div className="space-y-3">
  //                 {vehicle.variants.map((variant, index) => (
  //                   <label key={index} className="cursor-pointer block">
  //                     <input
  //                       type="radio"
  //                       name="variant"
  //                       checked={selectedVariant === index}
  //                       onChange={() => setSelectedVariant(index)}
  //                       className="sr-only"
  //                     />
  //                     <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
  //                       selectedVariant === index 
  //                         ? 'border-emerald-500 bg-emerald-50 shadow-md' 
  //                         : 'border-gray-200 hover:border-gray-300 bg-white'
  //                     }`}>
  //                       <div className="flex items-center justify-between">
  //                         <span className="font-bold text-gray-900 text-lg">{variant.name}</span>
  //                         <span className="text-emerald-600 font-bold text-xl">{variant.price} VNĐ</span>
  //                       </div>
  //                     </div>
  //                   </label>
  //                 ))}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Features & Specifications */}
  //     <div className="max-w-7xl mx-auto px-6 py-16">
  //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  //         {/* Features */}
  //         <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
  //           <div className="flex items-center mb-6">
  //             <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
  //               <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
  //                 <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
  //               </svg>
  //             </div>
  //             <h3 className="text-2xl font-bold text-gray-900">Tính năng nổi bật</h3>
  //           </div>
  //           <div className="space-y-4">
  //             {currentVariant.features.map((feature, index) => (
  //               <div key={index} className="flex items-start group">
  //                 <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 mt-0.5 group-hover:bg-emerald-200 transition-colors">
  //                   <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
  //                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
  //                   </svg>
  //                 </div>
  //                 <span className="text-gray-700 font-medium">{feature}</span>
  //               </div>
  //             ))}
  //           </div>
  //         </div>

  //         {/* Specifications */}
  //         <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/20">
  //           <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
  //             <div className="flex items-center">
  //               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
  //                 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
  //                   <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
  //                 </svg>
  //               </div>
  //               <h3 className="text-2xl font-bold text-white">Thông số kỹ thuật</h3>
  //             </div>
  //           </div>
  //           <div className="p-8">
  //             <div className="space-y-4">
  //               {Object.entries(vehicle.specifications).map(([key, value]) => (
  //                 <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
  //                   <span className="font-medium text-gray-700">{key}</span>
  //                   <span className="text-gray-900 font-bold">{value}</span>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Contact Section */}
  //     <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 py-20">
  //       <div className="max-w-4xl mx-auto px-6">
  //         <div className="text-center mb-12">
  //           <h2 className="text-4xl font-bold text-white mb-4">Liên hệ tư vấn ngay</h2>
  //           <p className="text-xl text-emerald-100">Nhận tư vấn chi tiết và báo giá tốt nhất cho {vehicle.name}</p>
  //         </div>
          
  //         {submitMessage && (
  //           <div className="mb-8 p-6 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl backdrop-blur-sm">
  //             <p className="text-emerald-50 font-medium text-center text-lg">{submitMessage}</p>
  //           </div>
  //         )}
          
  //         <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
  //           <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  //             <div>
  //               <label htmlFor="name" className="block text-sm font-bold text-white mb-3">
  //                 Họ và tên *
  //               </label>
  //               <input
  //                 type="text"
  //                 id="name"
  //                 name="name"
  //                 required
  //                 value={contactForm.name}
  //                 onChange={handleContactFormChange}
  //                 className="w-full px-4 py-4 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500"
  //                 placeholder="Nhập họ và tên của bạn"
  //               />
  //             </div>
              
  //             <div>
  //               <label htmlFor="phone" className="block text-sm font-bold text-white mb-3">
  //                 Số điện thoại *
  //               </label>
  //               <input
  //                 type="tel"
  //                 id="phone"
  //                 name="phone"
  //                 required
  //                 value={contactForm.phone}
  //                 onChange={handleContactFormChange}
  //                 className="w-full px-4 py-4 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500"
  //                 placeholder="Nhập số điện thoại"
  //               />
  //             </div>
              
  //             <div>
  //               <label htmlFor="email" className="block text-sm font-bold text-white mb-3">
  //                 Email *
  //               </label>
  //               <input
  //                 type="email"
  //                 id="email"
  //                 name="email"
  //                 required
  //                 value={contactForm.email}
  //                 onChange={handleContactFormChange}
  //                 className="w-full px-4 py-4 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500"
  //                 placeholder="Nhập địa chỉ email"
  //               />
  //             </div>
  //           </form>
            
  //           <div className="text-center">
  //             <button
  //               type="submit"
  //               onClick={handleContactSubmit}
  //               disabled={isSubmitting}
  //               className={`px-16 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
  //                 isSubmitting
  //                   ? 'bg-gray-400 text-white cursor-not-allowed'
  //                   : 'bg-white text-emerald-700 hover:bg-emerald-50 shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-1'
  //               }`}
  //             >
  //               {isSubmitting ? (
  //                 <span className="flex items-center justify-center">
  //                   <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  //                   </svg>
  //                   Đang gửi...
  //                 </span>
  //               ) : (
  //                 'Gửi thông tin liên hệ'
  //               )}
  //             </button>
  //           </div>

  //           {/* Contact Info */}
  //           <div className="mt-12 pt-8 border-t border-white/20">
  //             <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12">
  //               <div className="flex items-center">
  //                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
  //                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  //                   </svg>
  //                 </div>
  //                 <span className="text-white font-bold text-lg">Hotline: 1900 555 123</span>
  //               </div>
  //               <div className="flex items-center">
  //                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
  //                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"/>
  //                   </svg>
  //                 </div>
  //                 <span className="text-white font-bold text-lg">support@electra.com</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default CarDetail;