import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

// Swiper core styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import vf3 from "../assets/images/vf3.jpg"
import vf5 from "../assets/images/vf5-color-4.webp"
import vf6 from "../assets/images/vf6.webp"
import vf7 from "../assets/images/vf7-uu-diem-3.webp"
import vf8 from "../assets/images/vf8.webp"
import vf9 from "../assets/images/vf9.webp"
import minio from "../assets/images/minio.webp"
import herio from "../assets/images/herio.webp"
import limo from "../assets/images/limo.webp"

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
            <img src={vf3} alt="VinFast VF3" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Khám phá VinFast VF3</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Thiết kế nhỏ gọn, linh hoạt cho thành phố hiện đại.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Tìm hiểu thêm</button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={vf5} alt="VinFast VF5" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Trải nghiệm VinFast VF5</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Công nghệ thông minh, an toàn và tiện nghi vượt trội.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Đặt lịch lái thử</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={vf6} alt="VinFast VF6" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">VinFast VF6 hoàn toàn mới</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Crossover linh hoạt cho gia đình trẻ.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Khám phá ngay</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={vf7} alt="VinFast VF7" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">VinFast VF7</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Thiết kế hiện đại, trải nghiệm công nghệ đỉnh cao.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Xem chi tiết</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={vf8} alt="VinFast VF8" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">VinFast VF8</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">SUV điện tầm trung đa dụng cho mọi hành trình.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Nhận ưu đãi</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={vf9} alt="VinFast VF9" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">VinFast VF9</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">SUV flagship sang trọng, 3 hàng ghế rộng rãi.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Đặt cọc ngay</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={minio} alt="Minio" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Khám phá Minio</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Giải pháp di chuyển thông minh cho cuộc sống hiện đại.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Tìm hiểu thêm</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={herio} alt="Herio" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Trải nghiệm Herio</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Công nghệ tiên tiến, thiết kế sang trọng và đẳng cấp.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Đặt lịch lái thử</button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[500px]">
            <img src={limo} alt="Limo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute left-6 md:left-12 bottom-8 md:bottom-12 text-white max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold drop-shadow">Limo sang trọng</h2>
              <p className="mt-2 md:mt-3 text-sm md:text-base opacity-90">Dịch vụ limousine cao cấp cho những chuyến đi đặc biệt.</p>
              <button className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Đặt xe ngay</button>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default HeroSlider


