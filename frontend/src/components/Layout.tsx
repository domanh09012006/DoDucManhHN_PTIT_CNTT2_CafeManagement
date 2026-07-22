import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService';
import {
  LayoutDashboard,
  Grid,
  Coffee,
  FolderOpen,
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  Users,
  UserCheck,
  Calendar,
  LineChart,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles?: string[];
}

const allNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'MANAGER'] },
  { icon: Grid, label: 'Quản lý Bàn', path: '/tables', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { icon: Coffee, label: 'Thực đơn', path: '/products', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { icon: FolderOpen, label: 'Danh mục', path: '/categories', roles: ['ADMIN', 'MANAGER'] },
  { icon: UserCheck, label: 'Tài khoản', path: '/users', roles: ['ADMIN'] },
  { icon: Users, label: 'Khách hàng', path: '/customers', roles: ['ADMIN', 'MANAGER'] },
  { icon: Calendar, label: 'Đặt bàn', path: '/reservations', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { icon: ShoppingCart, label: 'Đặt hàng', path: '/orders', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { icon: CreditCard, label: 'Thanh toán', path: '/payments', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { icon: Package, label: 'Kho hàng', path: '/inventory', roles: ['ADMIN', 'MANAGER'] },
  { icon: Truck, label: 'Nhà cung cấp', path: '/suppliers', roles: ['ADMIN', 'MANAGER'] },
  { icon: LineChart, label: 'Báo cáo', path: '/reports', roles: ['ADMIN', 'MANAGER'] },
];

const roleLabel: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  CASHIER: 'Thu ngân',
  CUSTOMER: 'Khách hàng',
};

const roleColor: Record<string, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-400',
  MANAGER: 'bg-blue-500/20 text-blue-400',
  CASHIER: 'bg-yellow-500/20 text-yellow-400',
  CUSTOMER: 'bg-green-500/20 text-green-400',
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userRole = user?.role || '';

  const navItems = allNavItems.filter(item =>
    !item.roles || item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
    } catch {
      // ignore
    } finally {
      logout();
      toast.success('Đã đăng xuất thành công');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans relative">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coffee-800/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-gray-900/40 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 z-20 relative`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-coffee-500/20 border border-coffee-400/20">
            <Coffee className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden animate-fade-in">
              <h1 className="font-extrabold text-white text-base tracking-wide bg-clip-text bg-gradient-to-r from-white to-gray-300">CoffeeMS</h1>
              <p className="text-coffee-400 text-[10px] uppercase tracking-wider font-semibold">Management Workspace</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-coffee-500/15 to-coffee-600/5 text-coffee-400 border border-coffee-500/30 shadow-[0_0_15px_-3px_rgba(212,130,26,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-coffee-500 rounded-r-md" />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110 group-hover:text-gray-200'}`} />
                {sidebarOpen && (
                  <span className={`truncate transition-transform duration-300 ${!isActive && 'group-hover:translate-x-0.5'}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5 bg-gray-950/20">
          {sidebarOpen ? (
            <div className="space-y-3 bg-white/5 border border-white/5 p-3 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 border border-white/10 shadow-inner">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-white text-xs font-semibold truncate leading-tight">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">@{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
                  userRole === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  userRole === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  userRole === 'CUSTOMER' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {roleLabel[userRole]}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors text-xs font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isLoggingOut ? '...' : 'Thoát'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 border border-white/10 shadow-inner" title={user?.fullName}>
                {user?.fullName?.[0] || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-[22px] z-30 bg-gray-900 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white p-1.5 rounded-full transition-all flex items-center justify-center shadow-lg hover:scale-105 cursor-pointer"
        style={{ left: sidebarOpen ? '242px' : '66px' }}
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900 custom-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default Layout;
