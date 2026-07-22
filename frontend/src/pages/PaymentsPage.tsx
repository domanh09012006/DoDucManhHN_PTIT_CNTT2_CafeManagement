import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { PaymentService, OrderService } from '../services';
import type { PaymentResponse, PaymentRequest, OrderResponse, PaymentStatus, PaymentMethod } from '../types';
import toast from 'react-hot-toast';
import { CreditCard, RotateCcw, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const methodLabel: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  CARD: 'Thẻ ngân hàng',
  BANK_TRANSFER: 'Chuyển khoản',
  E_WALLET: 'Ví điện tử',
};

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn tiền',
  FAILED: 'Thất bại',
};

const statusColor: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
  REFUNDED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<OrderResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [payForm, setPayForm] = useState<PaymentRequest>({ orderId: 0, method: 'CASH', amountReceived: 0 });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('');
  const PAGE_SIZE = 10;

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await PaymentService.getAll({ status: filterStatus || undefined, page, size: PAGE_SIZE });
      if (res.success) { setPayments(res.data.content); setTotal(res.data.totalElements); }
    } catch { toast.error('Không thể tải danh sách thanh toán'); }
    finally { setLoading(false); }
  }, [filterStatus, page]);

  const fetchCompletedOrders = useCallback(async () => {
    try {
      // Get in-progress orders that need payment
      const res = await OrderService.getAll({ status: undefined, size: 100 });
      if (res.success) {
        const activeOrders = res.data.content.filter(
          o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
        );
        setCompletedOrders(activeOrders);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const openPayModal = async () => {
    await fetchCompletedOrders();
    setSelectedOrder(null);
    setPayForm({ orderId: 0, method: 'CASH', amountReceived: 0 });
    setShowPayModal(true);
  };

  const selectOrder = (order: OrderResponse) => {
    setSelectedOrder(order);
    setPayForm({ ...payForm, orderId: order.id, amountReceived: order.totalAmount });
  };

  const handlePay = async () => {
    if (!selectedOrder) { toast.error('Vui lòng chọn đơn hàng'); return; }
    if (payForm.amountReceived < selectedOrder.totalAmount) {
      toast.error('Số tiền nhận không đủ'); return;
    }
    setSaving(true);
    try {
      await PaymentService.process(payForm);
      toast.success('Thanh toán thành công!');
      setShowPayModal(false);
      fetchPayments();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleRefund = async (id: number) => {
    const reason = prompt('Nhập lý do hoàn tiền:');
    if (!reason) return;
    try {
      await PaymentService.refund(id, reason);
      toast.success('Đã hoàn tiền thành công');
      fetchPayments();
    } catch { toast.error('Không thể hoàn tiền'); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const change = selectedOrder ? Math.max(0, payForm.amountReceived - selectedOrder.totalAmount) : 0;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CreditCard className="w-6 h-6 text-amber-500" /> Quản lý Thanh toán</h1>
            <p className="text-gray-400 text-sm mt-1">{total} giao dịch</p>
          </div>
          <button onClick={openPayModal} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all">
            <CreditCard className="w-4 h-4" /> Thanh toán đơn hàng
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['', 'PENDING', 'PAID', 'REFUNDED', 'FAILED'] as (PaymentStatus | '')[]).map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              {s ? statusLabel[s as PaymentStatus] : 'Tất cả'}
            </button>
          ))}
        </div>

        {/* Payments table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-gray-400 text-sm">Mã thanh toán</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Mã đơn</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Thu ngân</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Phương thức</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Số tiền</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Trạng thái</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Thời gian</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-500">Chưa có giao dịch nào</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-all">
                    <td className="px-4 py-3 text-amber-400 font-mono text-sm">{p.paymentCode}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{p.orderCode}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{p.cashierName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{methodLabel[p.method]}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold text-sm">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs border ${statusColor[p.status]}`}>{statusLabel[p.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '—'}</td>
                    <td className="px-4 py-3">
                      {p.status === 'PAID' && (
                        <button onClick={() => handleRefund(p.id)} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" /> Hoàn tiền</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-gray-400 text-sm">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-500" /> Thanh toán đơn hàng</h2>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            {/* Select order */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Chọn đơn hàng cần thanh toán:</label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {completedOrders.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Không có đơn hàng cần thanh toán</p>
                ) : completedOrders.map(o => (
                  <button key={o.id} onClick={() => selectOrder(o)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${selectedOrder?.id === o.id ? 'border-amber-500 bg-amber-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <span className="text-white text-sm">{o.orderCode} – {o.tableNumber ? `Bàn ${o.tableNumber}` : 'Mang đi'}</span>
                    <span className="text-amber-400 text-sm font-semibold">{formatCurrency(o.totalAmount)}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedOrder && (
              <>
                <hr className="border-white/10 mb-4" />
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Phương thức thanh toán</label>
                    <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value as PaymentMethod })}
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      {(Object.keys(methodLabel) as PaymentMethod[]).map(m => (
                        <option key={m} value={m} className="bg-gray-900">{methodLabel[m]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Số tiền nhận (₫)</label>
                    <input type="number" min={selectedOrder.totalAmount} value={payForm.amountReceived}
                      onChange={e => setPayForm({ ...payForm, amountReceived: +e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cần thanh toán:</span>
                    <span className="text-amber-400 font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tiền thừa:</span>
                    <span className="text-green-400 font-bold">{formatCurrency(change)}</span>
                  </div>
                </div>
                <button onClick={handlePay} disabled={saving}
                  className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
                  {saving ? 'Đang xử lý...' : <><Check className="w-5 h-5" /> Xác nhận thanh toán</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PaymentsPage;
