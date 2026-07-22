import React from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { Gift, Star, Calendar, Percent, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromotionsPage: React.FC = () => {
  const promos = [
    {
      badge: 'Khung giờ vàng',
      title: 'Happy Hour - Giảm 20% Thức Uống',
      desc: 'Giảm ngay 20% cho toàn bộ các món nước trong menu của quán từ 14:00 đến 17:00 hàng ngày từ Thứ 2 đến Thứ 6.',
      date: 'Áp dụng vô thời hạn',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/25 text-amber-400',
    },
    {
      badge: 'Thứ 2 đầu tuần',
      title: 'Mua 1 Tặng 1 Cà Phê Máy',
      desc: 'Chào tuần mới tràn đầy năng lượng! Tặng 01 ly Espresso hoặc Cappuccino cỡ nhỏ khi mua bất kỳ ly cỡ lớn nào tại quầy.',
      date: 'Áp dụng Thứ 2 hàng tuần',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/25 text-blue-400',
    },
    {
      badge: 'Thành viên mới',
      title: 'Đăng Ký Thành Viên - Giảm Ngay 10%',
      desc: 'Đăng ký tài khoản khách hàng thân thiết trực tuyến hôm nay và nhận mã giảm giá 10% cho hóa đơn gọi món đầu tiên.',
      date: 'Áp dụng cho khách hàng mới',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/25 text-purple-400',
    },
    {
      badge: 'Combo Bữa Sáng',
      title: 'Combo Sáng Năng Lượng - Chỉ 49K',
      desc: 'Tận hưởng bữa sáng hoàn hảo gồm 01 ly Cà phê sữa đá truyền thống thơm ngon và 01 chiếc Bánh sừng bò Croissant nóng giòn.',
      date: 'Áp dụng từ 07:00 đến 09:30 hàng ngày',
      color: 'from-green-500/20 to-emerald-500/10 border-green-500/25 text-green-400',
    }
  ];

  return (
    <CustomerLayout>
      {/* Title */}
      <section className="py-20 text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Chương Trình Khuyến Mãi</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">Cập nhật những ưu đãi hấp dẫn nhất từ CoffeeMS dành riêng cho thực khách</p>
      </section>

      {/* Promos Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promos.map((p, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${p.color} border rounded-[32px] p-8 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <span className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {p.badge}
                </span>
                <h3 className="text-white font-extrabold text-xl leading-tight">{p.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-semibold">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {p.date}</span>
                <Link to="/customer-menu" className="text-white hover:text-coffee-400 flex items-center gap-1 transition-colors">
                  Sử dụng ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </CustomerLayout>
  );
};

export default PromotionsPage;
