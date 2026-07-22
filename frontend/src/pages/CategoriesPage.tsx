import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { CategoryService } from '../services';
import type { CategoryResponse, CategoryRequest } from '../types';
import toast from 'react-hot-toast';
import { FolderOpen, Plus, Search, Check, Pause, Pencil, Trash2 } from 'lucide-react';

const emptyForm: CategoryRequest = { name: '', description: '', imageUrl: '', active: true };

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<CategoryResponse | null>(null);
  const [form, setForm] = useState<CategoryRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CategoryService.getAll(keyword ? { keyword } : undefined);
      if (res.success) setCategories(res.data);
    } catch {
      toast.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    if (name === 'name') {
      const val = value.trim();
      if (!val) errorMsg = 'Tên danh mục không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Tên danh mục phải từ 2 đến 50 ký tự';
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
    setEditCat(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const openEdit = (c: CategoryResponse) => {
    setEditCat(c);
    setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', active: c.active });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['name'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateField(field, form.name);
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
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
      };

      if (editCat) {
        await CategoryService.update(editCat.id, payload);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await CategoryService.create(payload);
        toast.success('Thêm danh mục thành công');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await CategoryService.toggleActive(id);
      toast.success('Đã cập nhật trạng thái');
      fetchCategories();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
      await CategoryService.delete(id);
      toast.success('Xoá danh mục thành công');
      fetchCategories();
    } catch {
      toast.error('Không thể xoá (có thể danh mục có sản phẩm)');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FolderOpen className="w-6 h-6 text-amber-500" /> Danh mục sản phẩm</h1>
            <p className="text-gray-400 text-sm mt-1">{categories.length} danh mục</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all">
            <Plus className="w-4 h-4" /> Thêm danh mục
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm w-full"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Tên danh mục</th>
                  <th className="table-th">Mô tả</th>
                  <th className="table-th">Sản phẩm</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="table-td text-center py-8 text-gray-500">Chưa có danh mục nào</td></tr>
                ) : categories.map(c => (
                  <tr key={c.id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400"><FolderOpen className="w-4 h-4" /></div>}
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-gray-400 text-sm">{c.description || '—'}</td>
                    <td className="table-td text-gray-300 text-sm">{c.productCount} sản phẩm</td>
                    <td className="table-td">
                      <button
                        onClick={() => handleToggleActive(c.id)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 ${c.active ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30'}`}
                      >
                        {c.active ? (
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
                    <td className="table-td">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Sửa</button>
                        <button onClick={() => handleDelete(c.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 className="text-white font-bold text-lg mb-4">{editCat ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div>
                <label className="text-gray-400 text-sm">Tên danh mục *</label>
                <input
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  onBlur={e => handleFieldBlur('name', e.target.value)}
                  className={`input-field mt-1 ${errors.name && touched.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.name && touched.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Mô tả</label>
                <textarea
                  rows={2}
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field mt-1 resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">URL hình ảnh</label>
                <input
                  value={form.imageUrl || ''}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="input-field mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Huỷ</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Đang lưu...' : editCat ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CategoriesPage;
