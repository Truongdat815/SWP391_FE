import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, Shield, ArrowRight } from 'lucide-react';
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
      range: '600km',
      speed: '250km/h',
      image: 'https://via.placeholder.com/400x300?text=Model+S',
    },
    {
      id: 2,
      name: 'Electra Model X',
      range: '550km',
      seats: '7 chỗ ngồi linh hoạt',
      image: 'https://via.placeholder.com/400x300?text=Model+X',
    },
    {
      id: 3,
      name: 'Electra Model R',
      range: '500km',
      acceleration: '0-100km/h trong 2.5s',
      image: 'https://via.placeholder.com/400x300?text=Model+R',
    },
  ];

  const technologies = [
    {
      icon: Zap,
      title: 'Công nghệ Pin Lượng tử',
      description: 'Tăng quãng đường di chuyển lên đến 30% và sạc đầy chỉ trong 15 phút.',
      image: 'https://via.placeholder.com/300x200?text=Battery',
    },
    {
      icon: Shield,
      title: 'Hệ thống Tự lái Thông minh',
      description: 'Bộ cảm biến và AI tiên tiến giúp bạn di chuyển an toàn trên mọi hành trình.',
      image: 'https://via.placeholder.com/300x200?text=Autonomous',
    },
    {
      icon: Car,
      title: 'Thiết kế Khí động học',
      description: 'Tối ưu hóa luồng không khí, giảm lực cản và tăng hiệu suất vận hành tối đa.',
      image: 'https://via.placeholder.com/300x200?text=Aerodynamic',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Electra</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#models" className="text-gray-700 hover:text-blue-600">
                Các Dòng Xe
              </a>
              <a href="#technology" className="text-gray-700 hover:text-blue-600">
                Công Nghệ
              </a>
              <a href="#news" className="text-gray-700 hover:text-blue-600">
                Tin Tức
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">
                Về Chúng Tôi
              </a>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                Đăng ký Lái thử
              </Button>
            </nav>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="md:hidden"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Tương Lai Của Sự Dịch Chuyển
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Trải nghiệm công nghệ xe điện đình cao, thiết kế sang trọng và hiệu suất vượt trội.
              Electra định nghĩa lại hành trình của bạn.
            </p>
            <Button size="lg" onClick={() => setIsModalOpen(true)}>
              Khám Phá Ngay
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Khám Phá Các Dòng Xe Electra
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {models.map((model) => (
              <div
                key={model.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{model.name}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">Quãng đường: {model.range}</p>
                    {model.speed && <p className="text-gray-600">Tốc độ tối đa: {model.speed}</p>}
                    {model.seats && <p className="text-gray-600">{model.seats}</p>}
                    {model.acceleration && <p className="text-gray-600">{model.acceleration}</p>}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
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
      <section id="technology" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Công Nghệ Đột Phá
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Electra tiên phong trong việc ứng dụng những công nghệ tiên tiến nhất để mang lại
            trải nghiệm lái xe an toàn, thông minh và bền vững.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={tech.image}
                    alt={tech.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon size={24} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{tech.title}</h3>
                    </div>
                    <p className="text-gray-600">{tech.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-xl font-bold">Electra</span>
              </div>
              <p className="text-gray-400">Dẫn đầu kỷ nguyên di chuyển bằng điện.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Khám phá</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#models" className="hover:text-white">
                    Các Dòng Xe
                  </a>
                </li>
                <li>
                  <a href="#technology" className="hover:text-white">
                    Công Nghệ
                  </a>
                </li>
                <li>
                  <a href="#news" className="hover:text-white">
                    Tin Tức
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Về Electra</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#about" className="hover:text-white">
                    Về Chúng Tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Chính sách
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Đăng ký nhận tin</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1"
                />
                <Button>Đăng ký</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 Electra. All rights reserved.</p>
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

