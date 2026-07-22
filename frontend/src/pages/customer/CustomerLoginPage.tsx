import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { Coffee, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/authService';
import { validateEmail, validatePhone, validateUsername, validatePassword } from '../../utils/validation';

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsRegister(params.get('mode') === 'register');
  }, [location.search]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (name: string, value: string, currentPassword?: string) => {
    let errorMsg = '';
    const val = value.trim();
    if (name === 'fullName' && isRegister) {
      if (!val) errorMsg = 'Họ và tên không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Họ và tên phải từ 2 đến 50 ký tự';
    } else if (name === 'username') {
      if (isRegister) {
        errorMsg = validateUsername(value) || '';
      } else {
        if (!val) errorMsg = 'Tên đăng nhập không được để trống';
      }
    } else if (name === 'email' && isRegister) {
      errorMsg = validateEmail(value) || '';
    } else if (name === 'phone' && isRegister && value) {
      errorMsg = validatePhone(value) || '';
    } else if (name === 'password') {
      if (isRegister) {
        errorMsg = validatePassword(value) || '';
      } else {
        if (!value) errorMsg = 'Mật khẩu không được để trống';
      }
    } else if (name === 'confirmPassword' && isRegister) {
      const pwd = currentPassword !== undefined ? currentPassword : form.password;
      if (!value) errorMsg = 'Vui lòng xác nhận mật khẩu';
      else if (value !== pwd) errorMsg = 'Mật khẩu xác nhận không khớp';
    }
    return errorMsg;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (touched[name]) {
        const errorMsg = validateField(name, value, name === 'password' ? value : updated.password);
        setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
      }
      return updated;
    });
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = isRegister 
      ? ['fullName', 'username', 'email', 'phone', 'password', 'confirmPassword']
      : ['username', 'password'];

    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fieldsToValidate.forEach(field => {
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

    if (isRegister) {
      setLoading(true);
      try {
        const res = await AuthService.register({
          fullName: form.fullName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        if (res.success) {
          toast.success('Đăng ký tài khoản thành công! Hãy đăng nhập.');
          setIsRegister(false);
          setForm({
            username: form.username.trim(),
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          });
          setErrors({});
          setTouched({});
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể đăng ký tài khoản');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await AuthService.login({
          usernameOrEmail: form.username.trim(),
          password: form.password,
        });

        if (res.success && res.data) {
          login(res.data);
          toast.success(`Chào mừng thành viên, ${res.data.fullName}!`);
          navigate('/customer/profile');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <CustomerLayout>
      <div className="py-20 flex items-center justify-center bg-gray-950/60 min-h-[80vh]">
        <div className="relative w-full max-w-md mx-4 animate-slide-up">
          <div className="glass-card p-8 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-md shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 mb-4 shadow-lg shadow-coffee-500/30 border border-coffee-400/20">
                <Coffee className="w-7 h-7 text-white animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Thành Viên CoffeeMS</h1>
              <p className="text-gray-400 text-sm mt-1">
                {isRegister ? 'Tạo tài khoản tích điểm đổi quà' : 'Đăng nhập trang cá nhân của bạn'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAction} className="space-y-4" noValidate>
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Họ và tên *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><User className="w-4.5 h-4.5" /></span>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Nguyễn Văn A"
                      className={`input-field pl-10 ${errors.fullName && touched.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                  </div>
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tên đăng nhập *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><User className="w-4.5 h-4.5" /></span>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="nguyenvana"
                    className={`input-field pl-10 ${errors.username && touched.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                </div>
                {errors.username && touched.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Địa chỉ Email *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><Mail className="w-4.5 h-4.5" /></span>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="email@example.com"
                        className={`input-field pl-10 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Số điện thoại</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><Phone className="w-4.5 h-4.5" /></span>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="0912345678"
                        className={`input-field pl-10 ${errors.phone && touched.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Mật khẩu *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><Lock className="w-4.5 h-4.5" /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Nhập mật khẩu"
                    className={`input-field pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
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

              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Xác nhận mật khẩu *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"><ShieldCheck className="w-4.5 h-4.5" /></span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Nhập lại mật khẩu"
                      className={`input-field pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold rounded-xl transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isRegister ? (
                  'Đăng ký tài khoản'
                ) : (
                  'Đăng nhập thành viên'
                )}
              </button>
            </form>

            {/* Toggle link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              {isRegister ? (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-coffee-400 hover:text-coffee-300 font-bold transition-colors cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </>
              ) : (
                <>
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="text-coffee-400 hover:text-coffee-300 font-bold transition-colors cursor-pointer"
                  >
                    Đăng ký thành viên
                  </button>
                </>
              )}
            </p>

            {/* Demo credentials */}
            {!isRegister && (
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-500 text-center mb-2 font-semibold">Tài khoản thành viên thử nghiệm</p>
                <div className="flex justify-center gap-6 text-xs text-gray-400 items-center font-mono">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-coffee-400" /> customer1</span>
                  <span className="flex items-center gap-1"><Key className="w-3.5 h-3.5 text-coffee-400" /> Customer@123</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerLoginPage;
