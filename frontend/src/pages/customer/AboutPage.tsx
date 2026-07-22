import React from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { Coffee, Award, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <Award className="w-6 h-6 text-coffee-400" />,
      title: 'Hương Vị Thượng Hạng',
      desc: 'Tập trung tuyệt đối vào chất lượng từng giọt cà phê thành phẩm trao tay thực khách.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-coffee-400" />,
      title: 'Nguồn Gốc Rõ Ràng',
      desc: 'Hạt cà phê sạch được mua trực tiếp từ nông hộ tại Tây Nguyên thông qua thương mại công bằng.'
    },
    {
      icon: <Heart className="w-6 h-6 text-coffee-400" />,
      title: 'Sự Tận Tâm',
      desc: 'Phục vụ khách hàng bằng cả trái tim, nụ cười thân thiện và lòng hiếu khách nồng nhiệt.'
    }
  ];

  return (
    <CustomerLayout>
      {/* Title section */}
      <section className="py-20 text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Câu Chuyện Về CoffeeMS</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">Về hành trình kiến tạo những ly cà phê nguyên chất chuẩn Tây Nguyên giữa lòng đô thị</p>
      </section>

      {/* Story detail */}
      <section className="pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-coffee-500/10 border border-coffee-500/20 rounded-full text-coffee-400 text-xs font-bold uppercase tracking-wider">
              Khởi nguồn từ năm 2020
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Hành Trình Kết Nối Đam Mê</h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              CoffeeMS được thành lập bởi một nhóm baristas và những người yêu hạt cà phê Việt Nam với mong muốn đem đến hương vị chuẩn mực của Robusta Buôn Ma Thuột và Arabica Đà Lạt đến cho thực khách Hà Nội.
            </p>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Không chỉ là một quán cà phê, chúng tôi mong muốn xây dựng một không gian kết nối bạn bè, khơi nguồn sáng tạo và thư thái tinh thần trong cuộc sống hối hả. Mỗi góc nhỏ tại CoffeeMS đều được thiết kế tỉ mỉ, ấm áp, đem lại sự thân thuộc như ở nhà.
            </p>
          </div>
          <div className="bg-gradient-to-br from-coffee-500/10 to-orange-950/20 border border-coffee-500/20 rounded-[32px] p-8 space-y-6 flex flex-col justify-center min-h-[350px] shadow-lg shadow-coffee-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coffee-500/15 border border-coffee-500/20 flex items-center justify-center text-coffee-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Vùng Nguyên Liệu</p>
                <p className="text-gray-400 text-xs mt-0.5">Buôn Ma Thuột, Đắk Lắk & Cầu Đất, Lâm Đồng</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coffee-500/15 border border-coffee-500/20 flex items-center justify-center text-coffee-400">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Phương Pháp Chế Biến</p>
                <p className="text-gray-400 text-xs mt-0.5">Chế biến ướt (Full Washed) & Chế biến mật ong (Honey)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coffee-500/15 border border-coffee-500/20 flex items-center justify-center text-coffee-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Độ Rang Độc Quyền</p>
                <p className="text-gray-400 text-xs mt-0.5">Rang vừa (Medium Roast) lưu hương hoa quả tự nhiên</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-900/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Giá Trị Cốt Lõi</h2>
            <p className="text-gray-400 text-sm">Những nguyên tắc vàng giúp chúng tôi phát triển bền vững mỗi ngày</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-coffee-500/10 border border-coffee-500/20 flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default AboutPage;
