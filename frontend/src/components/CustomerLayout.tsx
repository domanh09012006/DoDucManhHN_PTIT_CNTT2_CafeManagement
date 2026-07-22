import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, Menu as MenuIcon, X, User, LogOut, Phone, MapPin, Mail, Award, Compass, Gift, MessageSquare, ShoppingBag, Calendar, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!dropdownOpen) return;
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất tài khoản khách hàng');
    navigate('/');
  };

  const navLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Menu thực đơn', path: '/customer-menu' },
    { label: 'Khuyến mãi', path: '/promotions' },
    { label: 'Liên hệ', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans relative selection:bg-coffee-500/30 selection:text-coffee-300">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coffee-900/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[10%] w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:scale-102 transition-transform">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white shadow-lg shadow-coffee-500/20 border border-coffee-400/20">
              <Coffee className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wide block">CoffeeMS</span>
              <span className="text-[9px] text-coffee-400 uppercase tracking-widest font-bold">Premium Cafe</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive ? 'text-coffee-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-bold text-gray-200 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-coffee-500/20 flex items-center justify-center border border-coffee-500/30">
                    <User className="w-3.5 h-3.5 text-coffee-400" />
                  </div>
                  <span>Xin chào, {user.fullName.split(' ').pop()}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-gray-900/95 backdrop-blur-lg border border-white/10 p-1.5 shadow-xl z-50 animate-fade-in">
                    <Link
                      to="/customer/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold"
                    >
                      <User className="w-4 h-4 text-coffee-400" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/customer/profile?tab=orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold"
                    >
                      <ShoppingBag className="w-4 h-4 text-coffee-400" />
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/customer/profile?tab=reservations"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-semibold"
                    >
                      <Calendar className="w-4 h-4 text-coffee-400" />
                      Đặt bàn của tôi
                    </Link>
                    <hr className="border-white/5 my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/customer/login?mode=login"
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-coffee-500 hover:bg-coffee-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-coffee-500/15"
                >
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Link>
                <Link
                  to="/customer/login?mode=register"
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden bg-gray-950 border-b border-white/5 py-4 px-4 space-y-3 animate-fade-in">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 text-sm font-semibold ${
                    isActive ? 'text-coffee-400' : 'text-gray-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/5">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-coffee-400 font-bold">
                    <div className="w-6 h-6 rounded-full bg-coffee-500/20 flex items-center justify-center border border-coffee-500/30">
                      <User className="w-3.5 h-3.5 text-coffee-400" />
                    </div>
                    <span>Xin chào, {user.fullName}</span>
                  </div>
                  <Link
                    to="/customer/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-xl transition-all"
                  >
                    <User className="w-4 h-4 text-coffee-400" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/customer/profile?tab=orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-xl transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 text-coffee-400" />
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    to="/customer/profile?tab=reservations"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-xl transition-all"
                  >
                    <Calendar className="w-4 h-4 text-coffee-400" />
                    Đặt bàn của tôi
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-all text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/customer/login?mode=login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-coffee-500 hover:bg-coffee-400 text-white rounded-xl text-sm font-bold transition-all"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/customer/login?mode=register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white">
                  <Coffee className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-white text-base tracking-wide">CoffeeMS</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Tận hưởng hương vị cà phê phin truyền thống và dòng sản phẩm hạt Arabica/Robusta tinh tế chất lượng hảo hạng từ Tây Nguyên lộng gió.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Compass className="w-4 h-4 text-coffee-400" /> Khám phá</h4>
              <ul className="space-y-2 text-xs text-gray-400 font-semibold">
                <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                <li><Link to="/customer-menu" className="hover:text-white transition-colors">Thực đơn đặc biệt</Link></li>
                <li><Link to="/promotions" className="hover:text-white transition-colors">Ưu đãi thành viên</Link></li>
              </ul>
            </div>

            {/* Column 3: Loyalty points info */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-coffee-400" /> Thành viên Gold</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                Tích lũy điểm thưởng với mỗi hóa đơn thanh toán để đổi bánh ngọt hoặc ly nước miễn phí. Đăng ký ngay để nhận ưu đãi lên đến 10%.
              </p>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-coffee-400" /> Thông tin liên hệ</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4.5 h-4.5 text-coffee-400 flex-shrink-0" />
                  <span>123 Đường Cà Phê, Quận Hoàn Kiếm, Hà Nội</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4.5 h-4.5 text-coffee-400 flex-shrink-0" />
                  <span>+84 90 123 4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-coffee-400 flex-shrink-0" />
                  <span>contact@coffeems.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} CoffeeMS. All rights reserved. Designed for Premium Cafe Experience.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
