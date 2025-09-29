import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const NewsSection = () => {
  const newsData = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      date: "22/05/2025",
      type: "SỰ KIỆN",
      title: "Electra ra mắt dòng xe điện mới với công nghệ pin tiên tiến"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop",
      date: "20/05/2025",
      type: "TIN TỨC",
      title: "Electra mở rộng mạng lưới trạm sạc tại 15 tỉnh thành trên cả nước"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop",
      date: "18/05/2025",
      type: "SỰ KIỆN",
      title: "Triển lãm xe điện quốc tế: Electra giới thiệu công nghệ tự lái Level 3"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      date: "16/05/2025",
      type: "TIN TỨC",
      title: "Electra đạt doanh số 10.000 xe trong quý đầu năm 2025"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      date: "14/05/2025",
      type: "SỰ KIỆN",
      title: "Chương trình lái thử miễn phí Electra tại các thành phố lớn"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      date: "12/05/2025",
      type: "TIN TỨC",
      title: "Electra hợp tác với các ngân hàng để hỗ trợ tài chính mua xe"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tin tức{' '}
            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              24h
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cập nhật những tin tức mới nhất về xe điện Electra, công nghệ và sự kiện nổi bật
          </p>
        </motion.div>

        {/* News Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.news-next',
              prevEl: '.news-prev',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            className="news-swiper"
          >
            {newsData.map((news) => (
              <SwiperSlide key={news.id}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* News Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {news.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* News Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 font-medium">
                        {news.date}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors duration-200">
                      {news.title}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button className="news-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 group">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button className="news-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 group">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
