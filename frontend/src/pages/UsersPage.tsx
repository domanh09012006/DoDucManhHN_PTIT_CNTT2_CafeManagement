import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, Plus, Search, Pencil, Trash2, Shield, Circle, Eye, EyeOff, Lock, Mail, Phone, UserCheck, UserX } from 'lucide-react';
import type { UserResponse, RegisterRequest, Role, UserStatus } from '../types/auth.types';
import { UserService } from '../services';
import { validateEmail, validatePhone, validateUsername, validatePassword } from '../utils/validation';

interface UserRequest {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  status: UserStatus;
}

const roleLabel: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  CASHIER: 'Thu ngân',
};

const roleColor: Record<string, string> = {
  ADMIN: 'bg-purple-500/25 text-purple-400 border-purple-500/30',
  MANAGER: 'bg-blue-500/25 text-blue-400 border-blue-500/30',
  CASHIER: 'bg-yellow-500/25 text-yellow-400 border-yellow-500/30',
};

const statusLabel = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Bị khóa',
};

const statusColor = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  INACTIVE: 'bg-red-500/20 text-red-400 border-red-500/30',
};



const emptyForm: UserRequest = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'CASHIER',
  status: 'ACTIVE',
};

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  // Initialize and load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await UserService.getAll();
      if (res.success) {
        setUsers(res.data);
      }
    } catch {
      toast.error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    const val = value.trim();
    if (name === 'fullName') {
      if (!val) errorMsg = 'Họ và tên không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Họ và tên phải từ 2 đến 50 ký tự';
    } else if (name === 'username' && !editUser) {
      errorMsg = validateUsername(value) || '';
    } else if (name === 'email') {
      errorMsg = validateEmail(value) || '';
    } else if (name === 'phone' && value) {
      errorMsg = validatePhone(value) || '';
    } else if (name === 'password' && !editUser) {
      errorMsg = validatePassword(value) || '';
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
    setEditUser(null);
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (u: UserResponse) => {
    setEditUser(u);
    setForm({
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      password: '',
      role: u.role as Role,
      status: u.status as 'ACTIVE' | 'INACTIVE',
    });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = editUser 
      ? ['fullName', 'email', 'phone'] 
      : ['fullName', 'username', 'email', 'phone', 'password'];
    
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

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        password: form.password || undefined,
        role: form.role,
        status: form.status,
      };

      if (editUser) {
        const res = await UserService.update(editUser.id, payload);
        if (res.success) {
          toast.success('Cập nhật tài khoản thành công');
          setShowModal(false);
          loadUsers();
        }
      } else {
        const res = await UserService.create(payload);
        if (res.success) {
          toast.success('Tạo tài khoản thành công');
          setShowModal(false);
          loadUsers();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đã xảy ra lỗi';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (currentUser && currentUser.username === username) {
      return toast.error('Không thể xóa tài khoản của chính bạn!');
    }
    if (username.toLowerCase() === 'admin') {
      return toast.error('Không thể xóa tài khoản quản trị hệ thống (admin)!');
    }
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${username}"?`)) return;

    try {
      const res = await UserService.delete(id);
      if (res.success) {
        toast.success('Đã xóa tài khoản');
        loadUsers();
      }
    } catch {
      toast.error('Không thể xóa tài khoản');
    }
  };

  const handleToggleStatus = async (id: number, username: string, currentStatus: UserStatus) => {
    if (currentUser && currentUser.username === username) {
      return toast.error('Không thể khóa tài khoản của chính bạn!');
    }
    if (username.toLowerCase() === 'admin') {
      return toast.error('Không thể khóa tài khoản quản trị hệ thống (admin)!');
    }

    try {
      const res = await UserService.toggleStatus(id);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái tài khoản`);
        loadUsers();
      }
    } catch {
      toast.error('Không thể thay đổi trạng thái tài khoản');
    }
  };

  // Search & Filters logic
  const filtered = users.filter(u => {
    const matchesKeyword =
      u.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      u.username.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase()) ||
      (u.phone && u.phone.includes(keyword));

    const matchesRole = !filterRole || u.role === filterRole;
    const matchesStatus = !filterStatus || u.status === filterStatus;

    return matchesKeyword && matchesRole && matchesStatus;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" /> Tài khoản & Phân quyền
            </h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý tài khoản truy cập hệ thống ({total} tài khoản)</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Thêm người dùng
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản, tên, email..."
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(0); }}
              className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm w-full"
            />
          </div>
          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
          >
            <option value="" className="bg-gray-900">Tất cả vai trò</option>
            <option value="ADMIN" className="bg-gray-900">Quản trị viên</option>
            <option value="MANAGER" className="bg-gray-900">Quản lý</option>
            <option value="CASHIER" className="bg-gray-900">Thu ngân</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
          >
            <option value="" className="bg-gray-900">Tất cả trạng thái</option>
            <option value="ACTIVE" className="bg-gray-900">Đang hoạt động</option>
            <option value="INACTIVE" className="bg-gray-900">Bị khóa</option>
          </select>
        </div>

        {/* User list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white/5 border border-white/10 rounded-2xl">Không tìm thấy tài khoản nào</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="table-th">Người dùng</th>
                  <th className="table-th">Email / SĐT</th>
                  <th className="table-th">Vai trò</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id} className="table-tr">
                    <td className="table-td">
                      <div>
                        <p className="text-white font-bold text-sm">{u.fullName}</p>
                        <p className="text-gray-400 font-mono text-xs mt-0.5">@{u.username}</p>
                      </div>
                    </td>
                    <td className="table-td">
                      <div>
                        <p className="text-gray-300 text-xs flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-500" /> {u.email}</p>
                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-500" /> {u.phone || '—'}</p>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`badge-label ${roleColor[u.role]}`}>
                        <Shield className="w-3 h-3" /> {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`badge-label ${statusColor[u.status as 'ACTIVE' | 'INACTIVE']}`}>
                        {statusLabel[u.status as 'ACTIVE' | 'INACTIVE']}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-all flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Sửa
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.username, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${u.status === 'ACTIVE' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                        >
                          {u.status === 'ACTIVE' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          {u.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
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
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              &larr;
            </button>
            <span className="text-gray-400 text-sm">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 className="text-white font-bold text-lg mb-4">{editUser ? 'Cập nhật tài khoản' : 'Tạo người dùng mới'}</h2>
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
                    disabled={!!editUser}
                    value={form.username}
                    onChange={e => handleFieldChange('username', e.target.value)}
                    onBlur={e => handleFieldBlur('username', e.target.value)}
                    placeholder="VD: nguyenvana"
                    className={`input-field mt-1 disabled:opacity-50 ${errors.username && touched.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  {errors.username && touched.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                  )}
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

              {!editUser && (
                <div>
                  <label className="text-gray-400 text-sm">Mật khẩu *</label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => handleFieldChange('password', e.target.value)}
                      onBlur={e => handleFieldBlur('password', e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className={`input-field pr-10 ${errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm">Vai trò</label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value as any })}
                    className="input-field mt-1 text-gray-300"
                  >
                    <option value="CASHIER" className="bg-gray-900">Thu ngân</option>
                    <option value="MANAGER" className="bg-gray-900">Quản lý</option>
                    <option value="ADMIN" className="bg-gray-900">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                    className="input-field mt-1 text-gray-300"
                  >
                    <option value="ACTIVE" className="bg-gray-900">Hoạt động</option>
                    <option value="INACTIVE" className="bg-gray-900">Bị khóa</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Đang lưu...' : editUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersPage;
