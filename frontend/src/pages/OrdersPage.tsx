import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { OrderService, TableService, ProductService } from '../services';
import type { OrderResponse, OrderRequest, TableResponse, ProductResponse, OrderStatus, OrderItemRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Eye, Play, Ban, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const statusLabel: Record<OrderStatus, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang pha chế',
  READY: 'Đã sẵn sàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

const statusColor: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PREPARING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  READY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<OrderResponse | null>(null);
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [form, setForm] = useState<OrderRequest>({ items: [], notes: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const PAGE_SIZE = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await OrderService.getAll({ status: filterStatus || undefined, page, size: PAGE_SIZE, sortBy: 'createdAt', sortDir: 'desc' } as Parameters<typeof OrderService.getAll>[0]);
      if (res.success) { setOrders(res.data.content); setTotal(res.data.totalElements); }
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoading(false); }
  }, [filterStatus, page]);

  const fetchTables = useCallback(async () => {
    try {
      const res = await TableService.getAll();
      if (res.success) setTables(res.data.filter(t => t.status === 'AVAILABLE' || t.status === 'OCCUPIED'));
    } catch { /* ignore */ }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await ProductService.getAvailable();
      if (res.success) setProducts(res.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchTables(); fetchProducts(); }, [fetchTables, fetchProducts]);

  const openCreate = () => {
    setForm({ items: [], tableId: undefined, discountAmount: 0, notes: '', orderSource: 'POS' });
    setShowModal(true);
  };

  const addItem = (productId: number) => {
    const existing = form.items.find(i => i.productId === productId);
    if (existing) {
      setForm({ ...form, items: form.items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      setForm({ ...form, items: [...form.items, { productId, quantity: 1 }] });
    }
  };

  const removeItem = (productId: number) => {
    setForm({ ...form, items: form.items.filter(i => i.productId !== productId) });
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { removeItem(productId); return; }
    setForm({ ...form, items: form.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i) });
  };

  const getTotal = () => {
    return form.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCreate = async () => {
    if (form.items.length === 0) { toast.error('Vui lòng thêm ít nhất 1 món'); return; }
    setSaving(true);
    try {
      await OrderService.create(form);
      toast.success('Tạo đơn hàng thành công');
      setShowModal(false);
      fetchOrders();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    try {
      await OrderService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
      if (showDetail?.id === id) setShowDetail(null);
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn huỷ đơn hàng này?')) return;
    try {
      await OrderService.cancel(id);
      toast.success('Đã huỷ đơn hàng');
      fetchOrders();
      if (showDetail?.id === id) setShowDetail(null);
    } catch { toast.error('Không thể huỷ đơn hàng'); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-amber-500" /> Quản lý Đơn hàng</h1>
            <p className="text-gray-400 text-sm mt-1">{total} đơn hàng</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all">
            <Plus className="w-4 h-4" /> Tạo đơn hàng
          </button>
        </div>

        {/* Filter by status */}
        <div className="flex gap-2 flex-wrap">
          {(['', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as (OrderStatus | '')[]).map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              {s ? statusLabel[s as OrderStatus] : 'Tất cả'}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden font-sans">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-gray-400 text-sm">Mã đơn</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Nguồn</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Bàn</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Người đặt</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Tổng tiền</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Trạng thái</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Thời gian</th>
                  <th className="px-4 py-3 text-gray-400 text-sm text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-500">Không có đơn hàng</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-all">
                    <td className="px-4 py-3 text-amber-400 font-mono text-sm">{o.orderCode}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.orderSource === 'ONLINE' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {o.orderSource || 'POS'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{o.tableNumber ? `Bàn ${o.tableNumber}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{o.staffName || '—'}</td>
                    <td className="px-4 py-3 text-amber-400 font-semibold text-sm">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setShowDetail(o)} className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs hover:bg-amber-500/30 flex items-center justify-center" title="Xem chi tiết"><Eye className="w-3.5 h-3.5" /></button>
                        
                        {o.status === 'PENDING' && (
                          <button onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 flex items-center justify-center" title="Xác nhận đơn"><Check className="w-3.5 h-3.5" /></button>
                        )}
                        {o.status === 'CONFIRMED' && (
                          <button onClick={() => handleUpdateStatus(o.id, 'PREPARING')} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs hover:bg-indigo-500/30 flex items-center justify-center" title="Chế biến"><Play className="w-3.5 h-3.5" /></button>
                        )}
                        {o.status === 'PREPARING' && (
                          <button onClick={() => handleUpdateStatus(o.id, 'READY')} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs hover:bg-purple-500/30 flex items-center justify-center" title="Báo sẵn sàng"><Check className="w-3.5 h-3.5" /></button>
                        )}
                        {o.status === 'READY' && (
                          <button onClick={() => handleUpdateStatus(o.id, 'COMPLETED')} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 flex items-center justify-center" title="Hoàn thành"><Check className="w-3.5 h-3.5" /></button>
                        )}

                        {o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && (
                          <button onClick={() => handleCancel(o.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 flex items-center justify-center" title="Huỷ đơn"><Ban className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
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

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl my-4">
            <h2 className="text-white font-bold text-lg mb-4">🛒 Tạo đơn hàng mới</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-sm">Bàn</label>
                <select value={form.tableId || ''} onChange={e => setForm({ ...form, tableId: e.target.value ? +e.target.value : undefined })}
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm bg-gray-900">
                  <option value="" className="bg-gray-900">Mang đi</option>
                  {tables.map(t => <option key={t.id} value={t.id} className="bg-gray-900">Bàn {t.tableNumber} ({t.status === 'AVAILABLE' ? 'Trống' : 'Đang phục vụ'})</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Ghi chú</label>
                <input value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Product list */}
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-2">☕ Thực đơn</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {products.map(p => (
                    <button key={p.id} onClick={() => addItem(p.id)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left">
                      <span className="text-white text-sm truncate">{p.name}</span>
                      <span className="text-amber-400 text-xs ml-2">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order items */}
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-2">📋 Đơn hàng</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {form.items.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Chưa có món nào</p>
                  ) : form.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <span className="text-white text-xs flex-1 truncate">{product?.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-5 h-5 bg-white/10 text-white rounded text-xs hover:bg-white/20">-</button>
                          <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-5 h-5 bg-white/10 text-white rounded text-xs hover:bg-white/20">+</button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-red-400 text-xs hover:text-red-300 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
                {form.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-amber-400 font-bold text-right">{formatCurrency(getTotal())}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all">Huỷ</button>
              <button onClick={handleCreate} disabled={saving || form.items.length === 0}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium disabled:opacity-50 transition-all">
                {saving ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Chi tiết đơn {showDetail.orderCode}</h2>
              <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Nguồn đơn:</span>
                <span className="text-white text-sm">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${showDetail.orderSource === 'ONLINE' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {showDetail.orderSource || 'POS'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Bàn:</span>
                <span className="text-white text-sm">{showDetail.tableNumber ? `Bàn ${showDetail.tableNumber}` : 'Mang đi'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Người đặt:</span>
                <span className="text-white text-sm">{showDetail.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Trạng thái:</span>
                <span className={`text-xs px-2 py-0.5 rounded-lg border ${statusColor[showDetail.status]}`}>{statusLabel[showDetail.status]}</span>
              </div>
              <hr className="border-white/10" />
              {showDetail.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.productName} x{item.quantity}</span>
                  <span className="text-amber-400">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <hr className="border-white/10" />
              <div className="flex justify-between font-bold">
                <span className="text-gray-300">Tổng cộng:</span>
                <span className="text-amber-400 text-lg">{formatCurrency(showDetail.totalAmount)}</span>
              </div>
              {showDetail.status !== 'COMPLETED' && showDetail.status !== 'CANCELLED' && (
                <div className="flex gap-2 mt-4">
                  {showDetail.status === 'PENDING' && (
                    <button onClick={() => handleUpdateStatus(showDetail.id, 'CONFIRMED')}
                      className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Xác nhận</button>
                  )}
                  {showDetail.status === 'CONFIRMED' && (
                    <button onClick={() => handleUpdateStatus(showDetail.id, 'PREPARING')}
                      className="flex-1 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl text-sm hover:bg-indigo-500/30 flex items-center justify-center gap-1.5"><Play className="w-4 h-4" /> Chế biến</button>
                  )}
                  {showDetail.status === 'PREPARING' && (
                    <button onClick={() => handleUpdateStatus(showDetail.id, 'READY')}
                      className="flex-1 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm hover:bg-purple-500/30 flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Sẵn sàng</button>
                  )}
                  {showDetail.status === 'READY' && (
                    <button onClick={() => handleUpdateStatus(showDetail.id, 'COMPLETED')}
                      className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Hoàn thành</button>
                  )}
                  <button onClick={() => handleCancel(showDetail.id)}
                    className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center justify-center gap-1.5"><Ban className="w-4 h-4" /> Huỷ đơn</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrdersPage;
