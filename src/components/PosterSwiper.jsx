import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

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

const PosterSwiper = () => {
  const posters = [
    {
      id: 1,
      name: 'Electra Ascent',
      image: ascentPoster,
      description: 'Luxury SUV với công nghệ tiên tiến'
    },
    {
      id: 2,
      name: 'Electra CityLink',
      image: citylinkPoster,
      description: 'Xe điện thông minh cho thành phố'
    },
    {
      id: 3,
      name: 'Electra GrandTour',
      image: grandtourPoster,
      description: 'Xe điện cao cấp cho gia đình'
    },
    {
      id: 4,
      name: 'Electra Micro',
      image: microPoster,
      description: 'Xe điện nhỏ gọn, tiện lợi'
    },
    {
      id: 5,
      name: 'Electra Summit',
      image: summitPoster,
      description: 'Xe điện thể thao mạnh mẽ'
    },
    {
      id: 6,
      name: 'Electra UrbanPulse',
      image: urbanplusePoster,
      description: 'Xe điện năng động cho giới trẻ'
    },
    {
      id: 7,
      name: 'Electra Velocity',
      image: velocityPoster,
      description: 'Xe điện tốc độ cao'
    },
    {
      id: 8,
      name: 'Electra Voyager',
      image: voyagerPoster,
      description: 'Xe điện phiêu lưu, khám phá'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Bộ Sưu Tập Xe Điện Electra
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Khám phá dòng xe điện tiên tiến với thiết kế hiện đại và công nghệ vượt trội. 
          Tương lai của di chuyển bền vững ngay hôm nay.
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={40}
        slidesPerView={2}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          1280: {
            slidesPerView: 2,
            spaceBetween: 50,
          },
        }}
        loop={true}
        className="poster-swiper"
      >
        {posters.map((poster) => (
          <SwiperSlide key={poster.id}>
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={poster.image}
                  alt={poster.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">{poster.name}</h3>
                  <p className="text-base md:text-lg opacity-90 leading-relaxed">{poster.description}</p>
                  <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                    Khám phá ngay
                  </button>
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <div className="flex justify-center items-center mt-12 space-x-6">
        <button className="swiper-button-prev bg-white shadow-xl hover:shadow-2xl rounded-full p-4 transition-all duration-300 hover:bg-gray-50 transform hover:scale-110">
          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex space-x-3">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"></div>
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        </div>
        
        <button className="swiper-button-next bg-white shadow-xl hover:shadow-2xl rounded-full p-4 transition-all duration-300 hover:bg-gray-50 transform hover:scale-110">
          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <style jsx global>{`
        .poster-swiper .swiper-pagination-bullet {
          background: #3b82f6;
          opacity: 0.5;
        }
        
        .poster-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #1d4ed8;
        }
        
        .poster-swiper .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .poster-swiper .swiper-slide {
          height: auto;
        }
        
        .poster-swiper .swiper-slide > div {
          height: 100%;
          min-height: 400px;
        }
        
        .poster-swiper img {
          object-position: center 30% !important;
          transform: scale(1.0);
          transition: transform 0.5s ease;
          width: 100% !important;
          height: 100% !important;
        }
        
        .poster-swiper .group:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default PosterSwiper;
