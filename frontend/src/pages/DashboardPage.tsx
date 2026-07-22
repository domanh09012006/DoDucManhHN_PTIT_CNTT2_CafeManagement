import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { DashboardService } from '../services';
import type { DashboardResponse } from '../types';
import { Coffee, Grid, ShoppingCart, CreditCard, Users, Package, Banknote, ClipboardList, CalendarDays, AlertTriangle, LineChart, TrendingUp, Zap, RefreshCw, LayoutDashboard } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className={`bg-gradient-to-br from-white/3 to-white/0 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all duration-300 shadow-md group`}>
    <div className={`w-10 h-10 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-black text-white mt-1">{value}</p>
    <p className="text-gray-500 text-[10px] mt-2 font-medium">{sub}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DashboardService.getDashboard();
      if (res.success) setDashboard(res.data);
    } catch {
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-coffee-400" />
              Tổng quan
            </h1>
            <p className="text-gray-400 text-sm mt-1">Hệ thống giám sát và vận hành quán cà phê của bạn</p>
          </div>
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2.5 px-4.5 py-2.5 bg-coffee-500/10 text-coffee-400 hover:text-white border border-coffee-500/20 hover:bg-coffee-500 rounded-2xl hover:scale-105 transition-all text-xs font-semibold cursor-pointer shadow-lg shadow-coffee-500/5 hover:shadow-coffee-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới dữ liệu
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {error}
          </div>
        )}

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Banknote className="w-5 h-5" />}
            label="Doanh thu hôm nay"
            value={formatCurrency(dashboard?.todayRevenue || 0)}
            sub={`Tăng trưởng: ${(dashboard?.revenueGrowthPercent || 0).toFixed(1)}% so với hôm qua`}
            color="amber"
          />
          <StatCard
            icon={<ClipboardList className="w-5 h-5" />}
            label="Đơn hàng hôm nay"
            value={String(dashboard?.todayOrderCount || 0)}
            sub={`POS: ${dashboard?.todayPosOrderCount || 0} | Online: ${dashboard?.todayOnlineOrderCount || 0}`}
            color="blue"
          />
          <StatCard
            icon={<Grid className="w-5 h-5" />}
            label="Trạng thái bàn"
            value={`${dashboard?.availableTables || 0}/${dashboard?.totalTables || 0}`}
            sub={`Đang dùng: ${dashboard?.occupiedTables || 0} | Đặt bàn hôm nay: ${dashboard?.todayReservationCount || 0}`}
            color="green"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Tài khoản hoạt động"
            value={String(dashboard?.activeEmployees || 0)}
            sub={`Tổng tài khoản: ${dashboard?.totalEmployees || 0} | Tồn kho thấp: ${dashboard?.lowStockIngredientCount || 0}`}
            color="purple"
          />
        </div>

        {/* Revenue this week/month */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white/3 to-white/0 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all duration-300 shadow-md">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-coffee-400" /> Doanh thu tuần này
            </h3>
            <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(dashboard?.weekRevenue || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-white/3 to-white/0 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all duration-300 shadow-md">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-400" /> Doanh thu tháng này
            </h3>
            <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(dashboard?.monthRevenue || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-white/3 to-white/0 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all duration-300 shadow-md">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Nguyên liệu cần nhập
            </h3>
            <p className={`text-2xl font-black tracking-tight ${(dashboard?.lowStockIngredientCount || 0) > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
              {dashboard?.lowStockIngredientCount || 0} mặt hàng sắp hết
            </p>
          </div>
        </div>

        {/* Charts and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Revenue Chart */}
          {dashboard?.recentRevenue && dashboard.recentRevenue.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-coffee-400" /> Doanh thu 7 ngày gần đây
              </h3>
              <div className="space-y-4">
                {dashboard.recentRevenue.slice().reverse().map((r, i) => {
                  const maxRevenue = Math.max(...dashboard.recentRevenue.map(x => x.revenue));
                  const pct = maxRevenue > 0 ? (r.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-4 group">
                      <span className="text-gray-400 text-xs w-24 flex-shrink-0 font-medium font-mono">
                        {new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-3 border border-white/5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-coffee-500 to-orange-500 h-full rounded-full transition-all duration-1000 group-hover:from-coffee-400 group-hover:to-orange-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-coffee-400 font-bold text-xs w-28 text-right flex-shrink-0">
                        {formatCurrency(r.revenue)}
                      </span>
                      <span className="text-gray-500 text-xs w-16 text-right flex-shrink-0 font-medium font-mono">
                        {r.orderCount} đơn
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Selling Products */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Sản phẩm bán chạy nhất
            </h3>
            {dashboard?.topProducts && dashboard.topProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboard.topProducts.map((p, i) => {
                  const maxQty = Math.max(...dashboard.topProducts.map(x => x.quantitySold));
                  const pct = maxQty > 0 ? (p.quantitySold / maxQty) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-4 group">
                      <span className="text-white text-xs w-28 flex-shrink-0 font-medium truncate" title={p.productName}>
                        {p.productName}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-3 border border-white/5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 group-hover:from-emerald-400 group-hover:to-teal-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-gray-400 font-bold text-xs w-16 text-right flex-shrink-0 font-mono">
                        {p.quantitySold} cốc
                      </span>
                      <span className="text-emerald-400 font-bold text-xs w-24 text-right flex-shrink-0 font-mono">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-12">Chưa có dữ liệu sản phẩm bán ra</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-coffee-400 animate-bounce-slow" /> Menu truy cập nhanh
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Grid, label: 'Sơ đồ Bàn', path: '/tables', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { icon: ShoppingCart, label: 'Đơn hàng', path: '/orders', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: CreditCard, label: 'Thanh toán', path: '/payments', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              { icon: Coffee, label: 'Thực đơn', path: '/products', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
              { icon: Users, label: 'Tài khoản', path: '/users', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { icon: Package, label: 'Kho hàng', path: '/inventory', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
            ].map((q) => (
              <Link
                key={q.path}
                to={q.path}
                className="flex flex-col items-center gap-3 p-5 bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-black/20 text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${q.color} shadow-inner transition-transform duration-300 hover:rotate-6`}>
                  <q.icon className="w-6 h-6" />
                </div>
                <span className="text-gray-200 text-xs font-semibold tracking-wide">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
