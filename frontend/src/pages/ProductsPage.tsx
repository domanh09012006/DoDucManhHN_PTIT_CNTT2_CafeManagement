import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { ProductService, CategoryService } from '../services';
import type { ProductResponse, ProductRequest, CategoryResponse, ProductStatus } from '../types';
import toast from 'react-hot-toast';
import { Coffee, Plus, Search, FolderOpen, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const statusLabel: Record<ProductStatus, string> = {
  AVAILABLE: 'Có sẵn',
  OUT_OF_STOCK: 'Hết hàng',
  DISCONTINUED: 'Ngừng bán',
};

const statusColor: Record<ProductStatus, string> = {
  AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
  OUT_OF_STOCK: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISCONTINUED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const emptyForm: ProductRequest = { name: '', description: '', price: 0, imageUrl: '', status: 'AVAILABLE', categoryId: undefined };

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ProductService.getAll({
        keyword: keyword || undefined,
        categoryId: filterCategory || undefined,
        status: filterStatus || undefined,
        page, size: PAGE_SIZE,
      });
      if (res.success) {
        setProducts(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [keyword, filterCategory, filterStatus, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await CategoryService.getAll({ active: true });
      if (res.success) setCategories(res.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const validateField = (name: string, value: any) => {
    let errorMsg = '';
    if (name === 'name') {
      const val = String(value).trim();
      if (!val) errorMsg = 'Tên sản phẩm không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Tên sản phẩm phải từ 2 đến 50 ký tự';
    } else if (name === 'price') {
      const val = Number(value);
      if (isNaN(val) || val <= 0) errorMsg = 'Giá bán phải lớn hơn 0';
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
    setEditProduct(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const openEdit = (p: ProductResponse) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, imageUrl: p.imageUrl || '', status: p.status, categoryId: p.categoryId });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['name', 'price'];
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
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
      };

      if (editProduct) {
        await ProductService.update(editProduct.id, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await ProductService.create(payload);
        toast.success('Thêm sản phẩm thành công');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá sản phẩm này?')) return;
    try {
      await ProductService.delete(id);
      toast.success('Xoá thành công');
      fetchProducts();
    } catch {
      toast.error('Không thể xoá');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Coffee className="w-6 h-6 text-amber-500" /> Thực đơn</h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý sản phẩm và menu ({total} sản phẩm)</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(0); }}
              className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value ? +e.target.value : ''); setPage(0); }}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
          >
            <option value="" className="bg-gray-900">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
          >
            <option value="" className="bg-gray-900">Tất cả trạng thái</option>
            <option value="AVAILABLE" className="bg-gray-900">Có sẵn</option>
            <option value="OUT_OF_STOCK" className="bg-gray-900">Hết hàng</option>
            <option value="DISCONTINUED" className="bg-gray-900">Ngừng bán</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Không có sản phẩm nào</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 transition-all group">
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Coffee className="w-16 h-16 text-amber-500/40" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate mb-1">{p.name}</h3>
                  {p.categoryName && <p className="text-gray-500 text-xs mb-2 flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" /> {p.categoryName}</p>}
                  <p className="text-amber-400 font-bold text-lg mb-2">{formatCurrency(p.price)}</p>
                  <span className={`inline-flex text-xs px-2 py-0.5 rounded-lg border mb-3 ${statusColor[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex-1 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1">
                      <Pencil className="w-3 h-3" /> Sửa
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="flex-1 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-1">
                      <Trash2 className="w-3 h-3" /> Xoá
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 className="text-white font-bold text-lg mb-4">{editProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div>
                <label className="text-gray-400 text-sm">Tên sản phẩm *</label>
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
                <label className="text-gray-400 text-sm">Giá *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => handleFieldChange('price', +e.target.value)}
                  onBlur={e => handleFieldBlur('price', +e.target.value)}
                  className={`input-field mt-1 ${errors.price && touched.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.price && touched.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Danh mục</label>
                <select value={form.categoryId || ''} onChange={e => setForm({ ...form, categoryId: e.target.value ? +e.target.value : undefined })}
                  className="input-field mt-1 text-gray-300">
                  <option value="" className="bg-gray-900">-- Không phân loại --</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Trạng thái</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProductStatus })}
                  className="input-field mt-1 text-gray-300">
                  <option value="AVAILABLE" className="bg-gray-900">Có sẵn</option>
                  <option value="OUT_OF_STOCK" className="bg-gray-900">Hết hàng</option>
                  <option value="DISCONTINUED" className="bg-gray-900">Ngừng bán</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">URL hình ảnh</label>
                <input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="input-field mt-1" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Mô tả</label>
                <textarea rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field mt-1 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Huỷ</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Đang lưu...' : editProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductsPage;
