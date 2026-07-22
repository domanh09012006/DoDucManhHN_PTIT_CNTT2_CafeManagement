import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { InventoryService, SupplierService } from '../services';
import type { IngredientResponse, IngredientRequest, InventoryTransactionResponse, InventoryTransactionRequest, SupplierResponse, TransactionType } from '../types';
import toast from 'react-hot-toast';
import { Package, Plus, Search, Beaker, History, AlertTriangle, Pencil, Pause, Play, ChevronLeft, ChevronRight, ArrowUpDown, ArrowDownLeft, ArrowUpRight, Scale, Undo } from 'lucide-react';

const txTypeLabel: Record<TransactionType, string> = {
  IMPORT: 'Nhập kho',
  EXPORT: 'Xuất kho',
  ADJUSTMENT: 'Điều chỉnh',
  RETURN: 'Trả hàng',
};

const txTypeIcon: Record<TransactionType, React.ReactNode> = {
  IMPORT: <ArrowDownLeft className="w-4 h-4 text-green-400" />,
  EXPORT: <ArrowUpRight className="w-4 h-4 text-red-400" />,
  ADJUSTMENT: <Scale className="w-4 h-4 text-yellow-400" />,
  RETURN: <Undo className="w-4 h-4 text-blue-400" />,
};

const formatCurrency = (v?: number) =>
  v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '—';

const InventoryPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransactionResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [totalIngredients, setTotalIngredients] = useState(0);
  const [totalTx, setTotalTx] = useState(0);
  const [pageIng, setPageIng] = useState(0);
  const [pageTx, setPageTx] = useState(0);
  const [tab, setTab] = useState<'ingredients' | 'transactions'>('ingredients');
  const [loading, setLoading] = useState(true);
  const [showIngModal, setShowIngModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [editIng, setEditIng] = useState<IngredientResponse | null>(null);
  const [ingForm, setIngForm] = useState<IngredientRequest>({ name: '', unit: '', minStockLevel: 0 });
  const [txForm, setTxForm] = useState<InventoryTransactionRequest>({ ingredientId: 0, type: 'IMPORT', quantity: 0 });
  const [ingErrors, setIngErrors] = useState<Record<string, string>>({});
  const [ingTouched, setIngTouched] = useState<Record<string, boolean>>({});
  const [txErrors, setTxErrors] = useState<Record<string, string>>({});
  const [txTouched, setTxTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');
  const PAGE_SIZE = 10;

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await InventoryService.getIngredients({ keyword: keyword || undefined, page: pageIng, size: PAGE_SIZE });
      if (res.success) { setIngredients(res.data.content); setTotalIngredients(res.data.totalElements); }
    } catch { toast.error('Không thể tải nguyên liệu'); }
    finally { setLoading(false); }
  }, [keyword, pageIng]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await InventoryService.getTransactions({ page: pageTx, size: PAGE_SIZE });
      if (res.success) { setTransactions(res.data.content); setTotalTx(res.data.totalElements); }
    } catch { toast.error('Không thể tải giao dịch kho'); }
    finally { setLoading(false); }
  }, [pageTx]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await SupplierService.getActive();
      if (res.success) setSuppliers(res.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { if (tab === 'ingredients') fetchIngredients(); else fetchTransactions(); }, [tab, fetchIngredients, fetchTransactions]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const validateIngField = (name: string, value: any) => {
    let errorMsg = '';
    if (name === 'name') {
      const val = String(value).trim();
      if (!val) errorMsg = 'Tên nguyên liệu không được để trống';
      else if (val.length < 2 || val.length > 100) errorMsg = 'Tên nguyên liệu phải từ 2 đến 100 ký tự';
    } else if (name === 'unit') {
      const val = String(value).trim();
      if (!val) errorMsg = 'Đơn vị không được để trống';
      else if (val.length < 1 || val.length > 20) errorMsg = 'Đơn vị phải từ 1 đến 20 ký tự';
    } else if (name === 'minStockLevel') {
      const val = Number(value);
      if (isNaN(val) || val < 0) errorMsg = 'Tồn kho tối thiểu phải >= 0';
    } else if (name === 'costPerUnit' && value !== undefined && value !== null && value !== '') {
      const val = Number(value);
      if (isNaN(val) || val < 0) errorMsg = 'Đơn giá phải >= 0';
    }
    return errorMsg;
  };

  const validateTxField = (name: string, value: any) => {
    let errorMsg = '';
    if (name === 'ingredientId') {
      const val = Number(value);
      if (!val || val <= 0) errorMsg = 'Vui lòng chọn nguyên liệu';
    } else if (name === 'quantity') {
      const val = Number(value);
      if (isNaN(val) || val <= 0) errorMsg = 'Số lượng phải lớn hơn 0';
    } else if (name === 'unitCost' && value !== undefined && value !== null && value !== '') {
      const val = Number(value);
      if (isNaN(val) || val < 0) errorMsg = 'Đơn giá phải >= 0';
    }
    return errorMsg;
  };

  const handleIngFieldChange = (name: string, value: any) => {
    setIngForm(prev => ({ ...prev, [name]: value }));
    if (ingTouched[name]) {
      const errorMsg = validateIngField(name, value);
      setIngErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleIngFieldBlur = (name: string, value: any) => {
    setIngTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateIngField(name, value);
    setIngErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleTxFieldChange = (name: string, value: any) => {
    setTxForm(prev => ({ ...prev, [name]: value }));
    if (txTouched[name]) {
      const errorMsg = validateTxField(name, value);
      setTxErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleTxFieldBlur = (name: string, value: any) => {
    setTxTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateTxField(name, value);
    setTxErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const openCreateIng = () => {
    setEditIng(null);
    setIngForm({ name: '', unit: '', minStockLevel: 0 });
    setIngErrors({});
    setIngTouched({});
    setShowIngModal(true);
  };

  const openEditIng = (i: IngredientResponse) => {
    setEditIng(i);
    setIngForm({ name: i.name, unit: i.unit, minStockLevel: i.minStockLevel, maxStockLevel: i.maxStockLevel, costPerUnit: i.costPerUnit, description: i.description, supplierId: i.supplierId });
    setIngErrors({});
    setIngTouched({});
    setShowIngModal(true);
  };

  const handleSaveIng = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['name', 'unit', 'minStockLevel', 'costPerUnit'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateIngField(field, ingForm[field as keyof typeof ingForm]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setIngErrors(newErrors);
    setIngTouched(newTouched);

    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) return;

    setSaving(true);
    try {
      const payload = {
        ...ingForm,
        name: ingForm.name.trim(),
        unit: ingForm.unit.trim(),
        description: ingForm.description?.trim() || undefined,
      };

      if (editIng) {
        await InventoryService.updateIngredient(editIng.id, payload);
        toast.success('Cập nhật nguyên liệu thành công');
      } else {
        await InventoryService.createIngredient(payload);
        toast.success('Thêm nguyên liệu thành công');
      }
      setShowIngModal(false);
      fetchIngredients();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await InventoryService.toggleIngredientActive(id);
      toast.success('Cập nhật thành công');
      fetchIngredients();
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const openTxModal = (ingredientId?: number) => {
    setTxForm({ ingredientId: ingredientId || 0, type: 'IMPORT', quantity: 0 });
    setTxErrors({});
    setTxTouched({});
    setShowTxModal(true);
  };

  const handleRecordTx = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['ingredientId', 'quantity', 'unitCost'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateTxField(field, txForm[field as keyof typeof txForm]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setTxErrors(newErrors);
    setTxTouched(newTouched);

    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) return;

    setSaving(true);
    try {
      const payload = {
        ...txForm,
        notes: txForm.notes?.trim() || undefined,
      };
      await InventoryService.recordTransaction(payload);
      toast.success('Ghi nhận giao dịch thành công');
      setShowTxModal(false);
      if (tab === 'ingredients') fetchIngredients(); else fetchTransactions();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const totalIngPages = Math.ceil(totalIngredients / PAGE_SIZE);
  const totalTxPages = Math.ceil(totalTx / PAGE_SIZE);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Package className="w-6 h-6 text-amber-500" /> Quản lý Kho hàng</h1>
            <p className="text-gray-400 text-sm mt-1">Nguyên liệu và lịch sử nhập/xuất kho</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openTxModal()} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4" /> Nhập/Xuất kho
            </button>
            <button onClick={openCreateIng} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Thêm nguyên liệu
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {(['ingredients', 'transactions'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 -mb-px text-sm font-medium transition-all border-b-2 flex items-center gap-1.5 ${tab === t ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {t === 'ingredients' ? <><Beaker className="w-4 h-4" /> Nguyên liệu</> : <><History className="w-4 h-4" /> Lịch sử giao dịch</>}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab === 'ingredients' && (
          <div className="relative w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input type="text" placeholder="Tìm nguyên liệu..." value={keyword} onChange={e => setKeyword(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm w-full" />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : tab === 'ingredients' ? (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-gray-400 text-sm">Nguyên liệu</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Đơn vị</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Tồn kho</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Tối thiểu</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Đơn giá</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Nhà cung cấp</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ingredients.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chưa có nguyên liệu</td></tr>
                  ) : ingredients.map(i => (
                    <tr key={i.id} className={`hover:bg-white/5 transition-all ${i.lowStock ? 'bg-red-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {i.lowStock && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                          <div>
                            <p className="text-white font-medium text-sm">{i.name}</p>
                            {i.description && <p className="text-gray-500 text-xs truncate max-w-32">{i.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{i.unit}</td>
                      <td className={`px-4 py-3 font-semibold text-sm ${i.lowStock ? 'text-red-400' : 'text-green-400'}`}>
                        {i.currentStock}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{i.minStockLevel}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{formatCurrency(i.costPerUnit)}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{i.supplierName || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openTxModal(i.id)} className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 flex items-center justify-center"><ArrowUpDown className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openEditIng(i)} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 flex items-center justify-center"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleToggleActive(i.id)} className={`px-2 py-1 rounded-lg text-xs flex items-center justify-center ${i.active ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}>
                            {i.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalIngPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPageIng(p => Math.max(0, p - 1))} disabled={pageIng === 0} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-gray-400 text-sm">{pageIng + 1} / {totalIngPages}</span>
                <button onClick={() => setPageIng(p => Math.min(totalIngPages - 1, p + 1))} disabled={pageIng >= totalIngPages - 1} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-gray-400 text-sm">Nguyên liệu</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Loại</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Số lượng</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Tồn trước</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Tồn sau</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Thực hiện bởi</th>
                    <th className="px-4 py-3 text-gray-400 text-sm">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chưa có giao dịch nào</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition-all">
                      <td className="px-4 py-3 text-white text-sm">{t.ingredientName} <span className="text-gray-500">({t.unit})</span></td>
                      <td className="px-4 py-3 text-sm flex items-center gap-1.5">{txTypeIcon[t.type]} {txTypeLabel[t.type]}</td>
                      <td className="px-4 py-3 text-amber-400 font-semibold text-sm">{t.quantity}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{t.stockBefore}</td>
                      <td className="px-4 py-3 text-green-400 text-sm">{t.stockAfter}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{t.performedByName || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalTxPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPageTx(p => Math.max(0, p - 1))} disabled={pageTx === 0} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-gray-400 text-sm">{pageTx + 1} / {totalTxPages}</span>
                <button onClick={() => setPageTx(p => Math.min(totalTxPages - 1, p + 1))} disabled={pageTx >= totalTxPages - 1} className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ingredient Modal */}
      {showIngModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">{editIng ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu'}</h2>
            <form onSubmit={handleSaveIng} className="space-y-3" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-gray-400 text-xs">Tên nguyên liệu *</label>
                  <input
                    value={ingForm.name}
                    onChange={e => handleIngFieldChange('name', e.target.value)}
                    onBlur={e => handleIngFieldBlur('name', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${ingErrors.name && ingTouched.name ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                  />
                  {ingErrors.name && ingTouched.name && (
                    <p className="text-red-500 text-xs mt-1">{ingErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Đơn vị *</label>
                  <input
                    value={ingForm.unit}
                    onChange={e => handleIngFieldChange('unit', e.target.value)}
                    onBlur={e => handleIngFieldBlur('unit', e.target.value)}
                    placeholder="kg, lít, cái..."
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${ingErrors.unit && ingTouched.unit ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                  />
                  {ingErrors.unit && ingTouched.unit && (
                    <p className="text-red-500 text-xs mt-1">{ingErrors.unit}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Tồn kho tối thiểu</label>
                  <input
                    type="number"
                    value={ingForm.minStockLevel || 0}
                    onChange={e => handleIngFieldChange('minStockLevel', +e.target.value)}
                    onBlur={e => handleIngFieldBlur('minStockLevel', +e.target.value)}
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${ingErrors.minStockLevel && ingTouched.minStockLevel ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                  />
                  {ingErrors.minStockLevel && ingTouched.minStockLevel && (
                    <p className="text-red-500 text-xs mt-1">{ingErrors.minStockLevel}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Đơn giá (₫)</label>
                  <input
                    type="number"
                    value={ingForm.costPerUnit || ''}
                    onChange={e => handleIngFieldChange('costPerUnit', e.target.value ? +e.target.value : '')}
                    onBlur={e => handleIngFieldBlur('costPerUnit', ingForm.costPerUnit)}
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${ingErrors.costPerUnit && ingTouched.costPerUnit ? 'border-red-500 focus:ring-red-500' : 'border-white/20'}`}
                  />
                  {ingErrors.costPerUnit && ingTouched.costPerUnit && (
                    <p className="text-red-500 text-xs mt-1">{ingErrors.costPerUnit}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Nhà cung cấp</label>
                  <select value={ingForm.supplierId || ''} onChange={e => setIngForm({ ...ingForm, supplierId: e.target.value ? +e.target.value : undefined })}
                    className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option value="" className="bg-gray-900">-- Không --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIngModal(false)} className="flex-1 py-2 bg-white/10 text-gray-300 rounded-xl text-sm">Huỷ</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                  {saving ? 'Đang lưu...' : editIng ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">📦 Ghi nhận giao dịch kho</h2>
            <form onSubmit={handleRecordTx} className="space-y-3" noValidate>
              <div>
                <label className="text-gray-400 text-sm">Nguyên liệu *</label>
                <select
                  value={txForm.ingredientId || ''}
                  onChange={e => handleTxFieldChange('ingredientId', +e.target.value)}
                  onBlur={e => handleTxFieldBlur('ingredientId', +e.target.value)}
                  className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 ${txErrors.ingredientId && txTouched.ingredientId ? 'border-red-500' : 'border-white/20'}`}
                >
                  <option value="" className="bg-gray-900">-- Chọn nguyên liệu --</option>
                  {ingredients.map(i => <option key={i.id} value={i.id} className="bg-gray-900">{i.name} (Tồn: {i.currentStock} {i.unit})</option>)}
                </select>
                {txErrors.ingredientId && txTouched.ingredientId && (
                  <p className="text-red-500 text-xs mt-1">{txErrors.ingredientId}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Loại giao dịch *</label>
                <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value as TransactionType })}
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  {(Object.keys(txTypeLabel) as TransactionType[]).map(t => (
                    <option key={t} value={t} className="bg-gray-900">{txTypeLabel[t]}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm">Số lượng *</label>
                  <input
                    type="number"
                    value={txForm.quantity || ''}
                    onChange={e => handleTxFieldChange('quantity', +e.target.value)}
                    onBlur={e => handleTxFieldBlur('quantity', +e.target.value)}
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 ${txErrors.quantity && txTouched.quantity ? 'border-red-500' : 'border-white/20'}`}
                  />
                  {txErrors.quantity && txTouched.quantity && (
                    <p className="text-red-500 text-xs mt-1">{txErrors.quantity}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Đơn giá (₫)</label>
                  <input
                    type="number"
                    value={txForm.unitCost || ''}
                    onChange={e => handleTxFieldChange('unitCost', e.target.value ? +e.target.value : '')}
                    onBlur={e => handleTxFieldBlur('unitCost', txForm.unitCost)}
                    className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 ${txErrors.unitCost && txTouched.unitCost ? 'border-red-500' : 'border-white/20'}`}
                  />
                  {txErrors.unitCost && txTouched.unitCost && (
                    <p className="text-red-500 text-xs mt-1">{txErrors.unitCost}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Ghi chú</label>
                <input value={txForm.notes || ''} onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTxModal(false)} className="flex-1 py-2 bg-white/10 text-gray-300 rounded-xl text-sm">Huỷ</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default InventoryPage;
