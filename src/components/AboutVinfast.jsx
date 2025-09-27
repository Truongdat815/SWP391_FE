// src/components/AboutVinfast.jsx

export default function AboutVinfast() {
    return (
      <section id="about" className="w-full bg-white">
        {/* Content section directly below HeroSlider */}
        <div className="w-full px-4 pt-8 pb-0">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-2 tracking-wide">Giới thiệu về</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Công ty VinFast
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                VinFast là công ty thành viên thuộc tập đoàn Vingroup, một trong 
                những Tập đoàn Kinh tế tư nhân đa ngành lớn nhất Châu Á.
              </p>
              <p>
                Với triết lý "Đặt khách hàng làm trọng tâm", VinFast không ngừng 
                sáng tạo để tạo ra các sản phẩm đẳng cấp và xuất sắc cho mọi 
                người.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
}
  