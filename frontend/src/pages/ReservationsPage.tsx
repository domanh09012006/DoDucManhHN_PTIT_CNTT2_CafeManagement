import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Users, X, Check, ClipboardCheck, Ban, Plus, Clock, RefreshCw } from 'lucide-react';
import { ReservationService, TableService } from '../services';
import { ReservationResponse, ReservationRequest, ReservationStatus, TableResponse } from '../types';
import Layout from '../components/Layout';
import { validatePhone } from '../utils/validation';

const statusLabel: Record<ReservationStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã nhận bàn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const statusColor: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CHECKED_IN: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const emptyForm: ReservationRequest = {
  tableId: undefined,
  reservationTime: '',
  numberOfGuests: 2,
  contactName: '',
  contactPhone: '',
  notes: '',
};

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ReservationRequest>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus ? (filterStatus as ReservationStatus) : undefined;
      const res = await ReservationService.getAll({
        status: statusParam,
        page,
        size: 10
      });
      if (res.success && res.data) {
        setReservations(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch (error: unknown) {
      toast.error('Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  const fetchTables = async () => {
    try {
      const res = await TableService.getAll();
      if (res.success && res.data) {
        setTables(res.data);
      }
    } catch (error: any) {
      console.error('Failed to load tables', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    fetchTables();
  }, []);

  const validateField = (name: string, value: any) => {
    let errorMsg = '';
    if (name === 'numberOfGuests') {
      const val = Number(value);
      if (isNaN(val) || val <= 0) errorMsg = 'Số lượng khách phải lớn hơn 0';
    } else if (name === 'reservationTime') {
      if (!value) errorMsg = 'Vui lòng chọn thời gian đặt bàn';
      else {
        const selected = new Date(value);
        if (selected <= new Date()) {
          errorMsg = 'Thời gian đặt bàn phải lớn hơn thời gian hiện tại';
        }
      }
    } else if (name === 'contactName') {
      const val = String(value).trim();
      if (!val) errorMsg = 'Tên khách hàng không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Tên khách hàng phải từ 2 đến 50 ký tự';
    } else if (name === 'contactPhone') {
      errorMsg = validatePhone(value) || '';
    }
    return errorMsg;
  };

  const handleFieldChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleFieldBlur = (name: string, value: any) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleUpdateStatus = async (id: number, status: ReservationStatus) => {
    try {
      const res = await ReservationService.updateStatus(id, status);
      if (res.success) {
        toast.success(`Cập nhật trạng thái sang "${statusLabel[status]}" thành công`);
        fetchReservations();
        fetchTables();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy lượt đặt bàn này?')) return;
    try {
      const res = await ReservationService.cancel(id);
      if (res.success) {
        toast.success('Hủy đặt bàn thành công');
        fetchReservations();
        fetchTables();
      }
    } catch (error: any) {
      toast.error('Không thể hủy đặt bàn');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['numberOfGuests', 'reservationTime', 'contactName', 'contactPhone'];
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
    if (hasError) return;

    try {
      const payload = {
        ...form,
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        notes: form.notes?.trim() || undefined,
      };

      const res = await ReservationService.create(payload);
      if (res.success) {
        toast.success('Tạo lượt đặt bàn thành công');
        setShowModal(false);
        setForm({ ...emptyForm });
        setErrors({});
        setTouched({});
        fetchReservations();
        fetchTables();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt bàn');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý Đặt bàn</h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý lịch hẹn, phê duyệt yêu cầu đặt bàn và cập nhật chỗ ngồi</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Đặt bàn tại quầy
            </button>
            <button
              onClick={fetchReservations}
              className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl transition-all border border-white/10"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap gap-3 card-glass p-4">
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm bg-gray-900"
          >
            <option value="" className="bg-gray-900">Tất cả trạng thái</option>
            {Object.entries(statusLabel).map(([key, label]) => (
              <option key={key} value={key} className="bg-gray-900">{label}</option>
            ))}
          </select>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="card-glass p-12 text-center text-gray-400">
            Không tìm thấy lượt đặt bàn nào phù hợp
          </div>
        ) : (
          <div className="card-glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5">Tên khách hàng</th>
                    <th className="py-4 px-5">Số điện thoại</th>
                    <th className="py-4 px-5">Bàn gán</th>
                    <th className="py-4 px-5">Thời gian hẹn</th>
                    <th className="py-4 px-5">Số khách</th>
                    <th className="py-4 px-5">Trạng thái</th>
                    <th className="py-4 px-5">Ghi chú</th>
                    <th className="py-4 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 text-sm">
                  {reservations.map(res => (
                    <tr key={res.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-white">{res.contactName}</div>
                        {res.customerName && (
                          <div className="text-xs text-amber-500/80">Khách ID: {res.customerName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-5">{res.contactPhone}</td>
                      <td className="py-3.5 px-5">
                        {res.tableNumber ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs font-semibold">
                            Bàn {res.tableNumber}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Chưa gán bàn</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-400">
                        {new Date(res.reservationTime).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-center">{res.numberOfGuests}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor[res.status]}`}>
                          {statusLabel[res.status]}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 text-xs max-w-[200px] truncate" title={res.notes}>
                        {res.notes || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="Xác nhận đặt bàn"
                            >
                              <Check className="w-3 h-3" /> Xác nhận
                            </button>
                          )}

                          {res.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'CHECKED_IN')}
                              className="px-2 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="Nhận khách nhận bàn"
                            >
                              <Clock className="w-3 h-3" /> Check-in
                            </button>
                          )}

                          {res.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'COMPLETED')}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="Hoàn thành trả bàn"
                            >
                              <ClipboardCheck className="w-3 h-3" /> Xong
                            </button>
                          )}

                          {res.status !== 'COMPLETED' && res.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(res.id)}
                              className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="Hủy đặt bàn"
                            >
                              <Ban className="w-3 h-3" /> Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-white/5 bg-white/5">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 text-xs"
                >
                  &larr; Trước
                </button>
                <span className="text-gray-400 text-xs">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 text-xs"
                >
                  Sau &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal đặt bàn mới */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-white font-bold text-lg">Đặt bàn mới tại quầy</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm font-medium">Bàn gán</label>
                  <select
                    value={form.tableId || ''}
                    onChange={e => setForm({ ...form, tableId: e.target.value ? Number(e.target.value) : undefined })}
                    className="input-field mt-1 text-gray-300 bg-gray-900"
                  >
                    <option value="" className="bg-gray-900">Chọn bàn trống</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id} className="bg-gray-900">
                        Bàn {t.tableNumber} - {t.area} (Chứa: {t.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium">Số lượng khách *</label>
                  <input
                    type="number"
                    value={form.numberOfGuests}
                    onChange={e => handleFieldChange('numberOfGuests', Number(e.target.value))}
                    onBlur={e => handleFieldBlur('numberOfGuests', Number(e.target.value))}
                    className={`input-field mt-1 ${errors.numberOfGuests && touched.numberOfGuests ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  {errors.numberOfGuests && touched.numberOfGuests && (
                    <p className="text-red-500 text-xs mt-1">{errors.numberOfGuests}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium">Thời gian đặt bàn *</label>
                <input
                  type="datetime-local"
                  value={form.reservationTime}
                  onChange={e => handleFieldChange('reservationTime', e.target.value)}
                  onBlur={e => handleFieldBlur('reservationTime', e.target.value)}
                  className={`input-field mt-1 text-gray-300 ${errors.reservationTime && touched.reservationTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.reservationTime && touched.reservationTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.reservationTime}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium">Tên khách hàng *</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={e => handleFieldChange('contactName', e.target.value)}
                  onBlur={e => handleFieldBlur('contactName', e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className={`input-field mt-1 ${errors.contactName && touched.contactName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.contactName && touched.contactName && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium">Số điện thoại *</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={e => handleFieldChange('contactPhone', e.target.value)}
                  onBlur={e => handleFieldBlur('contactPhone', e.target.value)}
                  placeholder="VD: 0912345678"
                  className={`input-field mt-1 ${errors.contactPhone && touched.contactPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.contactPhone && touched.contactPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium">Ghi chú</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Yêu cầu đặc biệt (nếu có)..."
                  rows={3}
                  className="input-field mt-1 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl shadow-lg transition-all"
                >
                  Đặt bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReservationsPage;
