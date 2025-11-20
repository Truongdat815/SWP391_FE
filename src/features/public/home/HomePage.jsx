import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Facebook, Twitter, Instagram } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useCreateAppointmentMutation } from '../../../api/public/appointmentApi';

const HomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    modelId: null,
  });
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(formData).unwrap();
      alert('Đăng ký lái thử thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setIsModalOpen(false);
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        preferredDate: '',
        preferredTime: '',
        modelId: null,
      });
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      console.error(error);
    }
  };

  const models = [
    {
      id: 1,
      name: 'Electra Model S',
      description: 'Quãng đường 600km - Tốc độ tối đa 250km/h',
      image: null, // Use CSS background instead
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
    },
    {
      id: 2,
      name: 'Electra Model X',
      description: 'Quãng đường 550km - 7 chỗ ngồi linh hoạt',
      image: null,
      bgColor: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
    },
    {
      id: 3,
      name: 'Electra Model R',
      description: 'Quãng đường 500km - Tăng tốc 0-100km/h trong 2.5s',
      image: null,
      bgColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
    },
  ];

  const technologies = [
    {
      title: 'Công nghệ Pin Lượng tử',
      description: 'Tăng quãng đường di chuyển lên đến 30% và sạc đầy chỉ trong 15 phút.',
      image: null,
      bgColor: 'bg-gradient-to-br from-cyan-600 to-blue-600',
      icon: '⚡',
    },
    {
      title: 'Hệ thống Tự lái Thông minh',
      description: 'Bộ cảm biến và AI tiên tiến giúp bạn di chuyển an toàn trên mọi hành trình.',
      image: null,
      bgColor: 'bg-gradient-to-br from-green-600 to-emerald-600',
      icon: '🤖',
    },
    {
      title: 'Thiết kế Khí động học',
      description: 'Tối ưu hóa luồng không khí, giảm lực cản và tăng hiệu suất vận hành tối đa.',
      image: null,
      bgColor: 'bg-gradient-to-br from-purple-600 to-pink-600',
      icon: '🌬️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <span className="text-2xl font-bold text-white">Electra</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#models" className="text-white hover:text-blue-400 transition-colors">
                Các Dòng Xe
              </a>
              <a href="#technology" className="text-white hover:text-blue-400 transition-colors">
                Công Nghệ
              </a>
              <a href="#news" className="text-white hover:text-blue-400 transition-colors">
                Tin Tức
              </a>
              <a href="#about" className="text-white hover:text-blue-400 transition-colors">
                Về Chúng Tôi
              </a>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Đăng nhập
              </Button>
              <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                Đăng ký Lái thử
              </Button>
            </nav>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="md:hidden border-white text-white"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tương Lai Của Sự Dịch Chuyển
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed">
            Trải nghiệm công nghệ xe điện đình cao, thiết kế sang trọng và hiệu suất vượt trội.
            Electra định nghĩa lại hành trình của bạn.
          </p>
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Khám Phá Ngay
            <ArrowRight className="ml-2" size={24} />
          </Button>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Khám Phá Các Dòng Xe Electra
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {models.map((model) => (
              <div
                key={model.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-700"
              >
                <div className={`relative h-64 overflow-hidden ${model.bgColor} flex items-center justify-center`}>
                  <div className="text-white text-6xl font-bold opacity-20">{model.name.charAt(model.name.length - 1)}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3">{model.name}</h3>
                  <p className="text-gray-300 mb-6 text-lg">{model.description}</p>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Tìm hiểu thêm
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-6">
            Công Nghệ Đột Phá
          </h2>
          <p className="text-center text-gray-300 text-lg mb-16 max-w-4xl mx-auto">
            Electra tiên phong trong việc ứng dụng những công nghệ tiên tiến nhất để mang lại
            trải nghiệm lái xe an toàn, thông minh và bền vững.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-700"
              >
                <div className={`relative h-48 overflow-hidden ${tech.bgColor} flex items-center justify-center`}>
                  <div className="text-white text-5xl opacity-30">{tech.icon}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{tech.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Logo & Tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
                <span className="text-2xl font-bold text-white">Electra</span>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Dẫn đầu kỷ nguyên di chuyển bằng điện.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            {/* Khám phá */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Khám phá</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#models" className="text-gray-400 hover:text-white transition-colors">
                    Các Dòng Xe
                  </a>
                </li>
                <li>
                  <a href="#technology" className="text-gray-400 hover:text-white transition-colors">
                    Công Nghệ
                  </a>
                </li>
                <li>
                  <a href="#news" className="text-gray-400 hover:text-white transition-colors">
                    Tin Tức
                  </a>
                </li>
              </ul>
            </div>

            {/* Về Electra */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Về Electra</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                    Về Chúng Tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Chính sách
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Đăng ký nhận tin</h4>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Đăng ký
                </Button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2024 Electra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Test Drive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký Lái thử"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Ngày mong muốn"
            type="date"
            value={formData.preferredDate}
            onChange={(e) =>
              setFormData({ ...formData, preferredDate: e.target.value })
            }
            required
          />
          <Input
            label="Giờ mong muốn"
            type="time"
            value={formData.preferredTime}
            onChange={(e) =>
              setFormData({ ...formData, preferredTime: e.target.value })
            }
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
