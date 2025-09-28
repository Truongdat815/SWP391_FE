import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

// Swiper core styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import electraAscent from "../assets/images/electra ascent.png"
import electraCitylink from "../assets/images/electra citylink poster.png"
import electraGrandtour from "../assets/images/electra grandtour.png"
import electraMicro from "../assets/images/electra micro.png"
import electraSummit from "../assets/images/electra summit.png"
import electraVelocity from "../assets/images/electra velocity.png"

function HeroSlider() {
  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="rounded-xl overflow-hidden"
      >
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={electraAscent} alt="Electra Ascent" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Khám phá Electra Ascent</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Xe điện đô thị thông minh, thiết kế nhỏ gọn và hiệu quả.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold">Tìm hiểu thêm</button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={electraCitylink} alt="Electra E2" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Trải nghiệm Electra E2</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Crossover điện thông minh, an toàn tuyệt đối và tiện nghi cao cấp.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold">Đặt lịch lái thử</button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={electraGrandtour} alt="Electra E3" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Electra E3 hoàn toàn mới</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">SUV điện cao cấp cho gia đình hiện đại.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold">Khám phá ngay</button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={electraMicro} alt="Electra E4" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Electra E4</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Thiết kế tương lai, công nghệ điện tiên tiến nhất.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold">Xem chi tiết</button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={electraSummit} alt="Electra E5" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Electra E5</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">SUV điện tầm trung, hiệu suất cao cho mọi hành trình.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold">Nhận ưu đãi</button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={electraVelocity} alt="Electra E6" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Electra E6</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">SUV flagship điện sang trọng, 3 hàng ghế cao cấp.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold">Đặt cọc ngay</button>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default HeroSlider