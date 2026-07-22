import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService';
import type { LoginRequest } from '../types/auth.types';
import { Coffee, User, Lock, Eye, EyeOff, Key } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    if (name === 'usernameOrEmail') {
      if (!value.trim()) errorMsg = 'Vui lòng nhập tên đăng nhập hoặc email';
    } else if (name === 'password') {
      if (!value) errorMsg = 'Vui lòng nhập mật khẩu';
      else if (value.length < 6) errorMsg = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return errorMsg;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['usernameOrEmail', 'password'];
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

    setIsLoading(true);
    try {
      const response = await AuthService.login({
        usernameOrEmail: form.usernameOrEmail.trim(),
        password: form.password,
      });
      if (response.success && response.data) {
        login(response.data);
        toast.success(`Chào mừng, ${response.data.fullName}!`);
        if (response.data.role === 'CASHIER') {
          navigate('/tables', { replace: true });
        } else if (response.data.role === 'CUSTOMER') {
          navigate('/', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-coffee-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-coffee-800/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-coffee-500/5 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 animate-slide-up">
        <div className="glass-card p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 mb-4 shadow-lg shadow-coffee-500/30">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Cafe Management</h1>
            <p className="text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  autoComplete="username"
                  value={form.usernameOrEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="username hoặc email@example.com"
                  className={`input-field pl-10 ${errors.usernameOrEmail && touched.usernameOrEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
              </div>
              {errors.usernameOrEmail && touched.usernameOrEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.usernameOrEmail}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập mật khẩu"
                  className={`input-field pl-10 pr-12 ${errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-coffee-400 hover:text-coffee-300 font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-500 text-center mb-2 font-medium">Demo credentials</p>
            <div className="flex justify-center gap-6 text-xs text-gray-400 items-center">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> <code className="text-coffee-400">admin</code></span>
              <span className="flex items-center gap-1"><Key className="w-4 h-4" /> <code className="text-coffee-400">Admin@123</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
