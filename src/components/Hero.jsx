import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import AnimatedImage from './Animated';

import ascentPoster from '../assets/images/electra ascent poster.png';
import citylinkPoster from '../assets/images/electra citylink poster.png';
import grandtourPoster from '../assets/images/electra grandtour poster.png';
import microPoster from '../assets/images/electra micro poster.png';
import summitPoster from '../assets/images/electra summit poster.png';
import urbanplusePoster from '../assets/images/electra urbanpluse poster.png';
import velocityPoster from '../assets/images/electra velocity poster.png';
import voyagerPoster from '../assets/images/electra voyager poster.png';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Hero = () => {
  const slides = [
    {
      id: 1,
      image: ascentPoster,
      title: 'Electra Ascent',
      subtitle: 'Luxury SUV với công nghệ tiên tiến',
      description: 'Trải nghiệm sang trọng và hiện đại với dòng SUV điện cao cấp',
      cta: 'Khám phá ngay'
    },
    {
      id: 2,
      image: citylinkPoster,
      title: 'Electra CityLink',
      subtitle: 'Xe điện thông minh cho thành phố',
      description: 'Giải pháp di chuyển thông minh cho cuộc sống đô thị hiện đại',
      cta: 'Tìm hiểu thêm'
    },
    {
      id: 3,
      image: grandtourPoster,
      title: 'Electra GrandTour',
      subtitle: 'Xe điện cao cấp cho gia đình',
      description: 'Không gian rộng rãi và tiện nghi cho mọi hành trình gia đình',
      cta: 'Đặt lịch lái thử'
    },
    {
      id: 4,
      image: microPoster,
      title: 'Electra Micro',
      subtitle: 'Xe điện nhỏ gọn, tiện lợi',
      description: 'Thiết kế nhỏ gọn, dễ dàng di chuyển trong thành phố',
      cta: 'Khám phá ngay'
    },
    {
      id: 5,
      image: summitPoster,
      title: 'Electra Summit',
      subtitle: 'Xe điện thể thao mạnh mẽ',
      description: 'Hiệu suất vượt trội và thiết kế thể thao đầy ấn tượng',
      cta: 'Trải nghiệm ngay'
    },
    {
      id: 6,
      image: urbanplusePoster,
      title: 'Electra UrbanPulse',
      subtitle: 'Xe điện năng động cho giới trẻ',
      description: 'Phong cách năng động, phù hợp với lối sống hiện đại',
      cta: 'Khám phá ngay'
    },
    {
      id: 7,
      image: velocityPoster,
      title: 'Electra Velocity',
      subtitle: 'Xe điện tốc độ cao',
      description: 'Tốc độ và hiệu suất vượt trội cho những ai yêu thích tốc độ',
      cta: 'Trải nghiệm ngay'
    },
    {
      id: 8,
      image: voyagerPoster,
      title: 'Electra Voyager',
      subtitle: 'Xe điện phiêu lưu, khám phá',
      description: 'Đồng hành cùng bạn trong mọi cuộc phiêu lưu khám phá',
      cta: 'Khám phá ngay'
    }
  ];

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.hero-swiper-next',
          prevEl: '.hero-swiper-prev',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        loop={true}
        className="hero-swiper h-full"
      >
        {slides.map((slide, _index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-screen w-full">
              {/* Background Image (Animated) */}
              <div className="absolute inset-0">
                <AnimatedImage
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(.7) contrast(.95)' }}
                />
              </div>
              
              {/* Overlay - Professional gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-800/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="mb-6"
                    >
                      <div className="inline-block mb-4">
                        <span className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full text-emerald-300 text-sm font-semibold tracking-wide">
                          XE ĐIỆN TƯƠNG LAI
                        </span>
                      </div>
                      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        {slide.title}
                      </h1>
                      <h2 className="text-2xl md:text-3xl text-emerald-400 font-semibold mb-6">
                        {slide.subtitle}
                      </h2>
                      <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8 max-w-xl">
                        {slide.description}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                      >
                        Khám phá ngay
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-4">
          <button className="hero-swiper-prev bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="hero-swiper-pagination"></div>
          
          <button className="hero-swiper-next bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-3 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      */

      <style jsx global>{`
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          width: 12px;
          height: 12px;
        }
        
        .hero-swiper .swiper-pagination-bullet-active {
          background: #10b981;
          transform: scale(1.2);
        }
        
        .hero-swiper .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
};

export default Hero;
