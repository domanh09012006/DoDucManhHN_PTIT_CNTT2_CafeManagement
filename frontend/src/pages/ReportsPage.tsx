import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { DashboardService } from '../services';
import type { RevenueReportResponse } from '../types';
import toast from 'react-hot-toast';
import { LineChart, RefreshCw, Banknote, ClipboardList, BarChart3 } from 'lucide-react';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const today = new Date().toISOString().split('T')[0];
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const ReportsPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueReportResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(thirtyDaysAgo);
  const [to, setTo] = useState(today);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DashboardService.getRevenueReport(from, to);
      if (res.success) setRevenueData(res.data);
    } catch {
      toast.error('Không thể tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
  const totalOrders = revenueData.reduce((sum, r) => sum + r.orderCount, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const maxRevenue = Math.max(...revenueData.map(r => r.revenue), 1);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><LineChart className="w-6 h-6 text-amber-500" /> Báo cáo Doanh thu</h1>
            <p className="text-gray-400 text-sm mt-1">Phân tích doanh thu theo thời gian</p>
          </div>
          <button onClick={fetchReport} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/30 transition-all text-sm">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Từ ngày:</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
          </div>
          <span className="text-gray-500">→</span>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Đến ngày:</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
          </div>
          {/* Quick selects */}
          <div className="ml-auto flex gap-2">
            {[
              { label: '7 ngày', days: 7 },
              { label: '30 ngày', days: 30 },
              { label: '90 ngày', days: 90 },
            ].map(q => (
              <button key={q.days} onClick={() => {
                setTo(today);
                setFrom(new Date(Date.now() - q.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              }}
                className="px-3 py-1 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg text-xs transition-all">
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><Banknote className="w-4 h-4 text-amber-500" /> Tổng doanh thu</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-gray-500 text-xs mt-1">Từ {from} đến {to}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-blue-500" /> Tổng đơn hàng</p>
            <p className="text-white text-2xl font-bold">{totalOrders.toLocaleString('vi-VN')}</p>
            <p className="text-gray-500 text-xs mt-1">Trong {revenueData.length} ngày</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-green-500" /> Doanh thu trung bình/đơn</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(avgOrder)}</p>
            <p className="text-gray-500 text-xs mt-1">Average order value</p>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-amber-500" /> Biểu đồ doanh thu theo ngày</h3>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Đang tải...</div>
          ) : revenueData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Không có dữ liệu trong khoảng thời gian này</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {revenueData.map((r, i) => {
                const pct = (r.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex items-center gap-3 group hover:bg-white/5 px-2 py-1 rounded-lg transition-all">
                    <span className="text-gray-400 text-xs w-24 flex-shrink-0">
                      {new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-white/5 rounded-full h-6 relative">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-400 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      >
                        {pct > 20 && (
                          <span className="text-white text-xs font-medium">{formatCurrency(r.revenue)}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs w-36 text-right flex-shrink-0">
                      {pct <= 20 ? formatCurrency(r.revenue) : ''}
                    </span>
                    <span className="text-gray-500 text-xs w-16 text-right flex-shrink-0">
                      {r.orderCount} đơn
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue table */}
        {revenueData.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-gray-400 text-sm">Ngày</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Doanh thu</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Số đơn</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">TB/đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {revenueData.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-all">
                    <td className="px-4 py-3 text-gray-300 text-sm">{new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold text-sm">{formatCurrency(r.revenue)}</td>
                    <td className="px-4 py-3 text-blue-400 text-sm">{r.orderCount}</td>
                    <td className="px-4 py-3 text-green-400 text-sm">{formatCurrency(r.averageOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 bg-white/5">
                  <td className="px-4 py-3 text-white font-bold text-sm">Tổng cộng</td>
                  <td className="px-4 py-3 text-amber-400 font-bold text-sm">{formatCurrency(totalRevenue)}</td>
                  <td className="px-4 py-3 text-blue-400 font-bold text-sm">{totalOrders}</td>
                  <td className="px-4 py-3 text-green-400 font-bold text-sm">{formatCurrency(avgOrder)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
