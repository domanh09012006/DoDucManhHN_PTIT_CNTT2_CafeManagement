import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Edit3, Trash2, ShieldAlert, UserPlus, X, RefreshCw } from 'lucide-react';
import { CustomerService } from '../services';
import type { UserResponse, Role, UserStatus } from '../types/auth.types';
import Layout from '../components/Layout';
import { validateEmail, validatePhone } from '../utils/validation';

interface UserRequest {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  status: UserStatus;
}

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Bị khóa',
};

const statusColor: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  INACTIVE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const emptyForm: UserRequest = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'CUSTOMER',
  status: 'ACTIVE',
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserRequest>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await CustomerService.getAll();
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await CustomerService.toggleStatus(id);
      if (res.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchCustomers();
      }
    } catch (error: any) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản khách hàng "${name}"?`)) return;
    try {
      const res = await CustomerService.delete(id);
      if (res.success) {
        toast.success('Xóa tài khoản khách hàng thành công');
        fetchCustomers();
      }
    } catch (error: any) {
      toast.error('Không thể xóa tài khoản khách hàng');
    }
  };

  const openCreate = () => {
    setEditCustomer(null);
    setForm({ ...emptyForm });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (c: UserResponse) => {
    setEditCustomer(c);
    setForm({
      fullName: c.fullName,
      username: c.username,
      email: c.email,
      phone: c.phone || '',
      password: '',
      role: 'CUSTOMER',
      status: c.status as any,
    });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['fullName', 'email', 'phone'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateField(field, form[field as keyof typeof form] || '');
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);

    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) return;

    try {
      if (editCustomer) {
        const payload = {
          ...form,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone?.trim() || undefined,
        };
        const res = await CustomerService.update(editCustomer.id, payload);
        if (res.success) {
          toast.success('Cập nhật thông tin khách hàng thành công');
          setShowModal(false);
          fetchCustomers();
        }
      } else {
        toast.error('Chức năng tạo mới khách hàng dành cho đăng ký của khách trên Web');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  };

  // Search and filter in frontend
  const filteredCustomers = customers.filter(c => {
    const matchKeyword = 
      c.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      c.username.toLowerCase().includes(keyword.toLowerCase()) ||
      c.email.toLowerCase().includes(keyword.toLowerCase()) ||
      (c.phone && c.phone.includes(keyword));

    const matchStatus = !filterStatus || c.status === filterStatus;

    return matchKeyword && matchStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý Khách hàng</h1>
            <p className="text-gray-400 text-sm mt-1">Danh sách thành viên, tích lũy điểm và thông tin liên hệ</p>
          </div>
          <button
            onClick={fetchCustomers}
            className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl transition-all border border-white/10"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-glass p-5 flex flex-col justify-between">
            <span className="text-gray-400 text-sm">Tổng số khách hàng</span>
            <span className="text-3xl font-extrabold text-white mt-2">{customers.length}</span>
          </div>
          <div className="card-glass p-5 flex flex-col justify-between">
            <span className="text-gray-400 text-sm">Khách đang hoạt động</span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-2">
              {customers.filter(c => c.status === 'ACTIVE').length}
            </span>
          </div>
          <div className="card-glass p-5 flex flex-col justify-between">
            <span className="text-gray-400 text-sm">Tài khoản bị khóa</span>
            <span className="text-3xl font-extrabold text-red-400 mt-2">
              {customers.filter(c => c.status === 'INACTIVE').length}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-3 card-glass p-4">
          <div className="relative flex-1 min-w-[280px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng theo tên, email, sđt..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm bg-gray-900"
          >
            <option value="" className="bg-gray-900">Tất cả trạng thái</option>
            <option value="ACTIVE" className="bg-gray-900">Đang hoạt động</option>
            <option value="INACTIVE" className="bg-gray-900">Bị khóa</option>
          </select>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="card-glass p-12 text-center text-gray-400">
            Không tìm thấy thông tin khách hàng nào phù hợp
          </div>
        ) : (
          <div className="card-glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5">Tên khách hàng</th>
                    <th className="py-4 px-5">Tài khoản</th>
                    <th className="py-4 px-5">Số điện thoại</th>
                    <th className="py-4 px-5">Email</th>
                    <th className="py-4 px-5">Trạng thái</th>
                    <th className="py-4 px-5">Ngày đăng ký</th>
                    <th className="py-4 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 text-sm">
                  {filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-all">
                      <td className="py-3.5 px-5 font-medium text-white">{c.fullName}</td>
                      <td className="py-3.5 px-5 text-gray-400">@{c.username}</td>
                      <td className="py-3.5 px-5">{c.phone || '—'}</td>
                      <td className="py-3.5 px-5">{c.email}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor[c.status]}`}>
                          {statusLabel[c.status]}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-all"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(c.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                              c.status === 'ACTIVE'
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            }`}
                            title={c.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.fullName)}
                            className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal chỉnh sửa */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-white font-bold text-lg">Cập nhật tài khoản Khách hàng</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

             <form onSubmit={handleSave} className="space-y-4" noValidate>
               <div>
                 <label className="text-gray-400 text-sm">Họ và tên *</label>
                 <input
                   value={form.fullName}
                   onChange={e => handleFieldChange('fullName', e.target.value)}
                   onBlur={e => handleFieldBlur('fullName', e.target.value)}
                   placeholder="VD: Nguyễn Văn A"
                   className={`input-field mt-1 ${errors.fullName && touched.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                 />
                 {errors.fullName && touched.fullName && (
                   <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                 )}
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-gray-400 text-sm">Tên đăng nhập *</label>
                   <input
                     disabled
                     value={form.username}
                     className="input-field mt-1 disabled:opacity-50"
                   />
                 </div>
                 <div>
                   <label className="text-gray-400 text-sm">Số điện thoại</label>
                   <input
                     value={form.phone || ''}
                     onChange={e => handleFieldChange('phone', e.target.value)}
                     onBlur={e => handleFieldBlur('phone', e.target.value)}
                     placeholder="0912345678"
                     className={`input-field mt-1 ${errors.phone && touched.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                   />
                   {errors.phone && touched.phone && (
                     <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                   )}
                 </div>
               </div>

               <div>
                 <label className="text-gray-400 text-sm">Email *</label>
                 <input
                   value={form.email}
                   onChange={e => handleFieldChange('email', e.target.value)}
                   onBlur={e => handleFieldBlur('email', e.target.value)}
                   placeholder="example@mail.com"
                   className={`input-field mt-1 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                 />
                 {errors.email && touched.email && (
                   <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                 )}
               </div>

               <div>
                 <label className="text-gray-400 text-sm">Trạng thái tài khoản</label>
                 <select
                   value={form.status}
                   onChange={e => setForm({ ...form, status: e.target.value as any })}
                   className="input-field mt-1 text-gray-300 bg-gray-900"
                 >
                   <option value="ACTIVE" className="bg-gray-900">Hoạt động</option>
                   <option value="INACTIVE" className="bg-gray-900">Khóa tài khoản</option>
                 </select>
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
                   Lưu thay đổi
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomersPage;
