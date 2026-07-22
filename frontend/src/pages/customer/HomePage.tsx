import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { Coffee, ArrowRight, ShieldCheck, Heart, Sparkles, Award, Star, Quote } from 'lucide-react';
import { ProductService } from '../../services';
import type { ProductResponse } from '../../types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await ProductService.getFeatured();
        if (res.success) {
          setFeaturedProducts(res.data.slice(0, 4));
        }
      } catch (err) {
        // Fallback to general available products if featured fails
        try {
          const res = await ProductService.getAvailable();
          if (res.success) setFeaturedProducts(res.data.slice(0, 4));
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: <Coffee className="w-6 h-6 text-coffee-400" />,
      title: 'Hạt Cà Phê Hảo Hạng',
      desc: 'Tuyển chọn từ các vùng nguyên liệu Robusta Đắk Lắk và Arabica Lâm Đồng chín mọng hữu cơ.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-coffee-400" />,
      title: 'Rang Xay Công Nghệ Cao',
      desc: 'Quy trình rang xay hiện đại lưu giữ trọn vẹn hương vị tự nhiên đặc trưng của từng hạt hạt.',
    },
    {
      icon: <Heart className="w-6 h-6 text-coffee-400" />,
      title: 'Barista Chuyên Nghiệp',
      desc: 'Đội ngũ Barista tâm huyết thổi hồn vào từng ly cà phê Latte Art và Espresso.',
    },
  ];

  const testimonials = [
    {
      quote: 'Cà phê đen đá ở đây rất đậm vị và thơm hậu ngọt đặc trưng. Không gian quán lại vô cùng yên tĩnh và thanh lịch.',
      author: 'Anh Tuấn - Lập trình viên',
      stars: 5,
    },
    {
      quote: 'Cappuccino có lớp bọt sữa vô cùng mịn màng và được tạo hình cực kỳ nghệ thuật. Tôi rất ấn tượng với phong cách phục vụ.',
      author: 'Chị Mai Anh - Nhà thiết kế',
      stars: 5,
    },
    {
      quote: 'Chương trình tích điểm đổi quà rất thú vị. Tôi thường xuyên mua bạc xỉu ở đây và đã đổi được bánh ngọt ăn kèm.',
      author: 'Bạn Lan Phương - Sinh viên Ngoại Thương',
      stars: 5,
    },
  ];

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract glowing circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-coffee-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-coffee-500/10 border border-coffee-500/25 rounded-full text-coffee-400 text-xs font-bold uppercase tracking-wider animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            Hương vị nguyên bản Tây Nguyên
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Hương Vị Đậm Đà,<br />
            <span className="bg-clip-text bg-gradient-to-r from-coffee-400 to-orange-500">Không Gian Tinh Tế</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            CoffeeMS là điểm đến lý tưởng cho những tín đồ say mê hương vị cà phê phin đậm đà truyền thống và cà phê máy espresso hiện đại. Kết nối bạn bè, khơi nguồn sáng tạo.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/customer-menu"
              className="px-8 py-4 bg-gradient-to-r from-coffee-500 to-orange-600 hover:from-coffee-400 hover:to-orange-500 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-coffee-500/20 hover:scale-102 transition-all cursor-pointer"
            >
              Xem thực đơn <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl hover:scale-102 transition-all"
            >
              Tìm hiểu câu chuyện
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Giá Trị Của Chúng Tôi</h2>
            <p className="text-gray-400 text-sm">Cam kết mang lại những hạt cà phê thuần khiết và dịch vụ tận tâm nhất</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all duration-300 shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-coffee-500/10 border border-coffee-500/20 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Món Bán Chạy Nhất</h2>
              <p className="text-gray-400 text-sm mt-1">Những thức uống được thực khách yêu thích và đặt nhiều nhất tại CoffeeMS</p>
            </div>
            <Link to="/customer-menu" className="text-coffee-400 hover:text-coffee-300 font-bold text-sm flex items-center gap-1 group">
              Tất cả món <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải thức uống...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có sản phẩm nổi bật nào</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <div key={p.id} className="bg-white/3 border border-white/5 rounded-3xl overflow-hidden hover:bg-white/6 transition-all duration-300 group">
                  <div className="h-48 bg-gradient-to-br from-coffee-900/40 to-orange-950/20 flex items-center justify-center relative overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <Coffee className="w-16 h-16 text-coffee-400/20" />
                    )}
                    {p.featured && (
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-coffee-500 text-white text-[10px] font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-white" /> Bestseller
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-bold text-base truncate mb-1">{p.name}</h3>
                    <p className="text-gray-400 text-xs truncate mb-3">{p.description || 'Thức uống cao cấp pha chế theo công thức riêng.'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-coffee-400 font-extrabold text-lg">{formatCurrency(p.price)}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{p.categoryName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Thực Khách Nói Gì</h2>
            <p className="text-gray-400 text-sm">Đánh giá thực tế từ các vị khách hàng thân thiết thường xuyên ghé thăm quán</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all duration-300 relative">
                <Quote className="w-8 h-8 text-coffee-500/10 absolute top-6 right-8" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm italic mb-6 leading-relaxed">"{t.quote}"</p>
                <p className="text-white font-bold text-xs">{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty CTA Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-coffee-500/20 to-orange-950/20 border border-coffee-500/25 rounded-[32px] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-coffee-500/5">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2.5">
                <Award className="w-8 h-8 text-coffee-400" /> Chương trình Thành viên Gold
              </h2>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                Đăng ký ngay hôm nay để tích luỹ điểm thưởng đổi quà tặng, ưu đãi sinh nhật và đặc quyền gọi món sớm nhất dành riêng cho bạn.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/customer/login"
                className="px-8 py-4 bg-gradient-to-r from-coffee-500 to-orange-600 hover:from-coffee-400 hover:to-orange-500 text-white font-bold rounded-2xl block text-center shadow-lg shadow-coffee-500/20 hover:scale-102 transition-all cursor-pointer"
              >
                Đăng ký thành viên ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default HomePage;
