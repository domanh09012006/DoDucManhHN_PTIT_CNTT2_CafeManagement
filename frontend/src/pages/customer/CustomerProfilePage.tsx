import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { User, Phone, Mail, Award, Clock, Calendar, Check, Save, Ban, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { UserService, ReservationService, OrderService } from '../../services';
import { ReservationResponse, OrderResponse, ReservationStatus, OrderStatus } from '../../types';
import { validateEmail, validatePhone } from '../../utils/validation';

const rankThresholds = {
  Bronze: { next: 'Silver', target: 50 },
  Silver: { next: 'Gold', target: 100 },
  Gold: { next: 'Diamond', target: 300 },
  Diamond: { next: 'Ultimate', target: 99999 },
};

const rankColor = {
  Bronze: 'from-orange-800 to-amber-700 text-orange-200 border-orange-600/30',
  Silver: 'from-gray-400 to-slate-500 text-slate-100 border-slate-400/30',
  Gold: 'from-amber-400 to-yellow-600 text-yellow-100 border-yellow-500/30',
  Diamond: 'from-cyan-500 to-blue-600 text-cyan-100 border-cyan-400/30',
};

const resStatusLabel: Record<ReservationStatus, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận bàn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const resStatusColor: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  CHECKED_IN: 'bg-indigo-500/20 text-indigo-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang pha chế',
  READY: 'Đã sẵn sàng',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

const orderStatusColor: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  PREPARING: 'bg-indigo-500/20 text-indigo-400',
  READY: 'bg-purple-500/20 text-purple-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, login } = useAuth();
  
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'orders' || tabParam === 'reservations') {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    const val = value.trim();
    if (name === 'fullName') {
      if (!val) errorMsg = 'Họ và tên không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Họ và tên phải từ 2 đến 50 ký tự';
    } else if (name === 'email') {
      errorMsg = validateEmail(value) || '';
    } else if (name === 'phone' && value) {
      errorMsg = validatePhone(value) || '';
    }
    return errorMsg;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  // Generate dynamic mock points/rank based on user id so it is persistent per user without changing database structure
  const userId = user?.id || 1;
  const points = (userId * 87) % 350;
  const rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 
    points >= 300 ? 'Diamond' : 
    points >= 150 ? 'Gold' : 
    points >= 50 ? 'Silver' : 'Bronze';

  const fetchHistory = async () => {
    if (!user) return;
    try {
      // Fetch reservations
      const resRes = await ReservationService.getByCustomer();
      if (resRes.success && resRes.data) {
        setReservations(resRes.data);
      }

      // Fetch orders
      const orderRes = await OrderService.getByCustomer({ page: 0, size: 20 });
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data.content);
      }
    } catch (error: any) {
      console.error('Failed to load profile history data', error);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem hồ sơ');
      navigate('/customer/login', { replace: true });
      return;
    }
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    fetchHistory();
  }, [user, navigate]);

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['fullName', 'email', 'phone'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateField(field, form[field as keyof typeof form]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);

    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) {
      return;
    }

    setSaving(true);
    try {
      const res = await UserService.updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
      });
      if (res.success && res.data) {
        login({
          accessToken: token || '',
          tokenType: 'Bearer',
          userId: res.data.id,
          username: res.data.username,
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
        }); // Update global AuthContext user details
        toast.success('Cập nhật thông tin tài khoản thành công');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch đặt bàn này?')) return;
    try {
      const res = await ReservationService.cancel(id);
      if (res.success) {
        toast.success('Hủy đặt bàn thành công');
        fetchHistory();
      }
    } catch (error: any) {
      toast.error('Không thể hủy đặt bàn');
    }
  };

  const threshold = rankThresholds[rank];
  const progressPct = Math.min((points / threshold.target) * 100, 100);

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 min-h-[80vh]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Member Card & Rank */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-coffee-400" /> Thẻ Thành Viên
            </h2>

            {/* Premium Loyalty Card */}
            <div className={`bg-gradient-to-br ${rankColor[rank]} border p-6 rounded-[32px] relative overflow-hidden shadow-xl shadow-black/30 min-h-[220px] flex flex-col justify-between`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Thành viên thân thiết</p>
                  <h3 className="text-2xl font-black mt-1">{rank} Member</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 font-black">
                  C
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-lg tracking-widest font-bold">
                  MEM-{user.createdAt?.slice(2, 4) || '26'}{user.createdAt?.slice(5, 7) || '07'}-{user.username.substring(0, 4).toUpperCase()}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] uppercase font-semibold opacity-70">Họ và tên</p>
                    <p className="text-sm font-bold">{user.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-semibold opacity-70">Điểm thưởng</p>
                    <p className="text-xl font-black">{points} PTS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level progress */}
            {rank !== 'Diamond' && (
              <div className="bg-white/3 border border-white/5 rounded-3xl p-6 space-y-3 shadow-md bg-white/5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">Tiến trình lên hạng {threshold.next}</span>
                  <span className="text-coffee-400">{points} / {threshold.target} điểm</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 border border-white/5 overflow-hidden">
                  <div className="bg-gradient-to-r from-coffee-500 to-orange-500 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Bạn cần tích lũy thêm {threshold.target - points} điểm để thăng cấp lên hạng tiếp theo.
                </p>
              </div>
            )}
          </div>

          {/* Column 2: Account Details & Activities */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/3 border border-white/5 rounded-3xl p-8 shadow-md bg-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight mb-6">Thông Tin Cá Nhân</h2>
              <form onSubmit={handleUpdate} className="space-y-4" noValidate>
                <div>
                  <label className="text-gray-400 text-sm">Họ và tên *</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`input-field mt-1.5 ${errors.fullName && touched.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Địa chỉ Email *</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className={`input-field mt-1.5 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    {errors.email && touched.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Số điện thoại</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="0912345678"
                      className={`input-field mt-1.5 ${errors.phone && touched.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    {errors.phone && touched.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-coffee-500 hover:bg-coffee-400 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow shadow-coffee-500/15"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Cập nhật tài khoản'}
                  </button>
                </div>
              </form>
            </div>

            {/* Visit & Reservation tabs */}
            <div className="bg-white/3 border border-white/5 rounded-3xl p-8 shadow-md bg-white/5">
              <div className="flex border-b border-white/10 mb-6 gap-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'orders' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> Đơn hàng Online ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'reservations' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Lịch đặt bàn ({reservations.length})
                </button>
              </div>

              {/* Tab 1: Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Bạn chưa đặt đơn hàng trực tuyến nào</p>
                  ) : (
                    orders.map(o => (
                      <div key={o.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-2 hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-amber-500 font-mono font-bold text-sm">{o.orderCode}</span>
                            <span className="text-gray-500 text-xs ml-3">
                              {new Date(o.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border border-white/5 ${orderStatusColor[o.status]}`}>
                            {orderStatusLabel[o.status]}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {o.items.map(item => `${item.productName} x${item.quantity}`).join(', ')}
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-white/5">
                          <span className="text-xs text-gray-500">Mã bàn: {o.tableNumber ? `Bàn ${o.tableNumber}` : 'Mang đi'}</span>
                          <span className="text-sm font-bold text-white">{formatCurrency(o.totalAmount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Reservations */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  {reservations.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">Bạn chưa có lịch đặt bàn nào</p>
                  ) : (
                    reservations.map(r => (
                      <div key={r.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/5 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${resStatusColor[r.status]}`}>
                              {resStatusLabel[r.status]}
                            </span>
                            {r.tableNumber && (
                              <span className="text-xs text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                                Bàn {r.tableNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-white text-sm font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-coffee-400" />
                            {new Date(r.reservationTime).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-4">
                            <span>Khách hẹn: {r.contactName} ({r.numberOfGuests} người)</span>
                            {r.notes && <span className="italic">Ghi chú: {r.notes}</span>}
                          </div>
                        </div>
                        
                        {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleCancelReservation(r.id)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" /> Hủy đặt bàn
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfilePage;
