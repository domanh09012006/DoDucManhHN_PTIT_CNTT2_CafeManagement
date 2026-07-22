import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { SupplierService } from '../services';
import type { SupplierResponse, SupplierRequest } from '../types';
import toast from 'react-hot-toast';
import { Truck, Plus, Search, Check, Pause, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { validateEmail, validatePhone } from '../utils/validation';

const emptyForm: SupplierRequest = { name: '', contactPerson: '', phone: '', email: '', address: '', active: true };

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSup, setEditSup] = useState<SupplierResponse | null>(null);
  const [form, setForm] = useState<SupplierRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');
  const PAGE_SIZE = 10;

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await SupplierService.getAll({ keyword: keyword || undefined, page, size: PAGE_SIZE });
      if (res.success) { setSuppliers(res.data.content); setTotal(res.data.totalElements); }
    } catch { toast.error('Không thể tải nhà cung cấp'); }
    finally { setLoading(false); }
  }, [keyword, page]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    if (name === 'name') {
      const val = value.trim();
      if (!val) errorMsg = 'Tên nhà cung cấp không được để trống';
      else if (val.length < 2 || val.length > 100) errorMsg = 'Tên nhà cung cấp phải từ 2 đến 100 ký tự';
    } else if (name === 'email' && value) {
      errorMsg = validateEmail(value) || '';
    } else if (name === 'phone' && value) {
      errorMsg = validatePhone(value) || '';
    }
    return errorMsg;
  };

  const handleFieldChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleFieldBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const openCreate = () => {
    setEditSup(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const openEdit = (s: SupplierResponse) => {
    setEditSup(s);
    setForm({ name: s.name, contactPerson: s.contactPerson || '', phone: s.phone || '', email: s.email || '', address: s.address || '', active: s.active });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['name', 'email', 'phone'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const val = form[field as keyof typeof form];
      const errorMsg = validateField(field, typeof val === 'string' ? val : '');
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
        name: form.name.trim(),
        contactPerson: form.contactPerson?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
      };

      if (editSup) {
        await SupplierService.update(editSup.id, payload);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await SupplierService.create(payload);
        toast.success('Thêm nhà cung cấp thành công');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    try {
      await SupplierService.toggleActive(id);
      toast.success('Cập nhật thành công');
      fetchSuppliers();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá nhà cung cấp này?')) return;
    try {
      await SupplierService.delete(id);
      toast.success('Xoá thành công');
      fetchSuppliers();
    } catch { toast.error('Không thể xoá'); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Truck className="w-6 h-6 text-amber-500" /> Nhà cung cấp</h1>
            <p className="text-gray-400 text-sm mt-1">{total} nhà cung cấp</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all">
            <Plus className="w-4 h-4" /> Thêm nhà cung cấp
          </button>
        </div>

        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input type="text" placeholder="Tìm nhà cung cấp..." value={keyword} onChange={e => setKeyword(e.target.value)}
            className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm w-full" />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-gray-400 text-sm">Tên NCC</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Người liên hệ</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Điện thoại</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Email</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Địa chỉ</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Trạng thái</th>
                  <th className="px-4 py-3 text-gray-400 text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {suppliers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chưa có nhà cung cấp nào</td></tr>
                ) : suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-white/5 transition-all">
                    <td className="px-4 py-3 text-white font-medium text-sm">{s.name}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{s.contactPerson || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm truncate max-w-32">{s.address || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(s.id)}
                        className={`px-2 py-1 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 ${s.active ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {s.active ? (
                          <>
                            <Check className="w-3 h-3" /> Hoạt động
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3" /> Tạm dừng
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(s.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-gray-400 text-sm">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">{editSup ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}</h2>
            <form onSubmit={handleSave} className="space-y-3" noValidate>
              <div>
                <label className="text-gray-400 text-sm">Tên NCC *</label>
                <input
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  onBlur={e => handleFieldBlur('name', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${errors.name && touched.name ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                />
                {errors.name && touched.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm">Người liên hệ</label>
                  <input
                    value={form.contactPerson || ''}
                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Điện thoại</label>
                  <input
                    value={form.phone || ''}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    onBlur={e => handleFieldBlur('phone', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${errors.phone && touched.phone ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                  />
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <input
                  value={form.email || ''}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  onBlur={e => handleFieldBlur('email', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Địa chỉ</label>
                <input
                  value={form.address || ''}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-white/10 text-gray-300 rounded-xl text-sm">Huỷ</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editSup ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SuppliersPage;
