import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { TableService } from '../services';
import type { TableResponse, TableRequest, TableStatus } from '../types';
import toast from 'react-hot-toast';
import { Grid, Plus, Users, Pencil, Trash2, Circle } from 'lucide-react';

const statusLabel: Record<TableStatus, string> = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang phục vụ',
  RESERVED: 'Đặt trước',
  CLEANING: 'Đang dọn dẹp',
  OUT_OF_SERVICE: 'Bảo trì',
};

const statusColor: Record<TableStatus, string> = {
  AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
  OCCUPIED: 'bg-red-500/20 text-red-400 border-red-500/30',
  RESERVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CLEANING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  OUT_OF_SERVICE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const statusIcon: Record<TableStatus, React.ReactNode> = {
  AVAILABLE: <Circle className="w-4 h-4 fill-green-500 text-green-500" />,
  OCCUPIED: <Circle className="w-4 h-4 fill-red-500 text-red-500" />,
  RESERVED: <Circle className="w-4 h-4 fill-blue-500 text-blue-500" />,
  CLEANING: <Circle className="w-4 h-4 fill-orange-500 text-orange-500" />,
  OUT_OF_SERVICE: <Circle className="w-4 h-4 fill-yellow-500 text-yellow-500" />,
};

const emptyForm: TableRequest = { tableNumber: '', capacity: 2, area: '', status: 'AVAILABLE', notes: '' };

const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState<TableResponse | null>(null);
  const [form, setForm] = useState<TableRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TableStatus | ''>('');

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await TableService.getAll();
      if (res.success) setTables(res.data);
    } catch {
      toast.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const validateField = (name: string, value: any) => {
    let errorMsg = '';
    if (name === 'tableNumber') {
      const val = String(value).trim();
      if (!val) errorMsg = 'Số bàn không được để trống';
      else if (val.length < 2 || val.length > 10) errorMsg = 'Số bàn phải từ 2 đến 10 ký tự';
    } else if (name === 'capacity') {
      const val = Number(value);
      if (isNaN(val) || val <= 0) errorMsg = 'Sức chứa phải lớn hơn 0';
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
    setEditTable(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const openEdit = (t: TableResponse) => {
    setEditTable(t);
    setForm({ tableNumber: t.tableNumber, capacity: t.capacity, area: t.area || '', status: t.status, notes: t.notes || '' });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['tableNumber', 'capacity'];
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

    setSaving(true);
    try {
      const payload = {
        ...form,
        tableNumber: form.tableNumber.trim(),
        area: form.area?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      if (editTable) {
        await TableService.update(editTable.id, payload);
        toast.success('Cập nhật bàn thành công');
      } else {
        await TableService.create(payload);
        toast.success('Tạo bàn thành công');
      }
      setShowModal(false);
      fetchTables();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá bàn này?')) return;
    try {
      await TableService.delete(id);
      toast.success('Xoá bàn thành công');
      fetchTables();
    } catch {
      toast.error('Không thể xoá bàn');
    }
  };

  const handleStatusChange = async (id: number, status: TableStatus) => {
    try {
      await TableService.updateStatus(id, status);
      toast.success('Cập nhật trạng thái thành công');
      fetchTables();
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const filtered = filterStatus ? tables.filter(t => t.status === filterStatus) : tables;

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    reserved: tables.filter(t => t.status === 'RESERVED').length,
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Grid className="w-6 h-6 text-amber-500" /> Quản lý Bàn</h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý bàn và trạng thái phục vụ</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm bàn
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng bàn', value: stats.total, color: 'text-white' },
            { label: 'Trống', value: stats.available, color: 'text-green-400' },
            { label: 'Đang phục vụ', value: stats.occupied, color: 'text-red-400' },
            { label: 'Đặt trước', value: stats.reserved, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'OUT_OF_SERVICE'] as (TableStatus | '')[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              {s ? statusLabel[s as TableStatus] : 'Tất cả'}
            </button>
          ))}
        </div>

        {/* Table grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Chưa có bàn nào</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((table) => (
              <div
                key={table.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">Bàn {table.tableNumber}</h3>
                    {table.area && <p className="text-gray-500 text-xs">{table.area}</p>}
                  </div>
                  <span className="flex items-center justify-center h-6 w-6">{statusIcon[table.status]}</span>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs border mb-3 ${statusColor[table.status]}`}>
                  {statusLabel[table.status]}
                </div>
                <p className="text-gray-400 text-xs mb-3 flex items-center gap-1.5"><Users className="w-4 h-4" /> {table.capacity} người</p>

                {/* Status quick change */}
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value as TableStatus)}
                  className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2"
                >
                  {(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'OUT_OF_SERVICE'] as TableStatus[]).map(s => (
                    <option key={s} value={s} className="bg-gray-900">{statusLabel[s]}</option>
                  ))}
                </select>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(table)}
                    className="flex-1 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="flex-1 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">
              {editTable ? 'Cập nhật bàn' : 'Thêm bàn mới'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div>
                <label className="text-gray-400 text-sm">Số bàn *</label>
                <input
                  value={form.tableNumber}
                  onChange={e => handleFieldChange('tableNumber', e.target.value)}
                  onBlur={e => handleFieldBlur('tableNumber', e.target.value)}
                  placeholder="VD: A01, B02..."
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${errors.tableNumber && touched.tableNumber ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                />
                {errors.tableNumber && touched.tableNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.tableNumber}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Sức chứa *</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={e => handleFieldChange('capacity', +e.target.value)}
                  onBlur={e => handleFieldBlur('capacity', +e.target.value)}
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 ${errors.capacity && touched.capacity ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                />
                {errors.capacity && touched.capacity && (
                  <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Khu vực</label>
                <input
                  value={form.area || ''}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  placeholder="VD: Tầng 1, Ngoài trời..."
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Ghi chú</label>
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editTable ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TablesPage;
