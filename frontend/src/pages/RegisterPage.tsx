import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthService from '../services/authService';
import type { RegisterRequest } from '../types/auth.types';
import { Coffee, User, Tag, Mail, Phone, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePhone, validateUsername, validatePassword } from '../utils/validation';

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  error?: string;
  autoComplete?: string;
  rightElement?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  id, name, label, type = 'text', placeholder, icon, value,
  error, autoComplete, rightElement, onChange, onBlur,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">{icon}</span>
      <input
        id={id} name={name} type={type} autoComplete={autoComplete}
        value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
        className={`input-field pl-10 ${rightElement ? 'pr-12' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterRequest>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateField = (name: string, value: string, currentPassword?: string) => {
    let errorMsg = '';
    const val = value.trim();
    if (name === 'fullName') {
      if (!val) errorMsg = 'Vui lòng nhập họ tên';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Họ tên phải từ 2 đến 50 ký tự';
    } else if (name === 'username') {
      errorMsg = validateUsername(value) || '';
    } else if (name === 'email') {
      errorMsg = validateEmail(value) || '';
    } else if (name === 'phone' && value) {
      errorMsg = validatePhone(value) || '';
    } else if (name === 'password') {
      errorMsg = validatePassword(value) || '';
    } else if (name === 'confirmPassword') {
      const pwd = currentPassword !== undefined ? currentPassword : form.password;
      if (!value) errorMsg = 'Vui lòng xác nhận mật khẩu';
      else if (value !== pwd) errorMsg = 'Mật khẩu xác nhận không khớp';
    }
    return errorMsg;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['fullName', 'username', 'email', 'phone', 'password', 'confirmPassword'];
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

    setIsLoading(true);
    try {
      const response = await AuthService.register({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (response.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login', { replace: true });
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
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (touched[name]) {
        const errorMsg = validateField(name, value, name === 'password' ? value : updated.password);
        setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
      }
      return updated;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-coffee-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-coffee-800/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg mx-4 animate-slide-up">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 mb-4 shadow-lg shadow-coffee-500/30">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Tạo tài khoản</h1>
            <p className="text-gray-400 text-sm mt-1">Đăng ký tài khoản nhân viên</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <InputField
              id="fullName" name="fullName" label="Họ và tên" icon={<User className="w-5 h-5" />}
              placeholder="Nguyễn Văn A" value={form.fullName} error={touched.fullName ? errors.fullName : undefined}
              onChange={handleChange} onBlur={handleBlur}
            />

            {/* Two columns: Username + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="username" name="username" label="Tên đăng nhập" icon={<Tag className="w-5 h-5" />}
                placeholder="nguyenvana" value={form.username} error={touched.username ? errors.username : undefined}
                autoComplete="username"
                onChange={handleChange} onBlur={handleBlur}
              />
              <InputField
                id="email" name="email" label="Email" icon={<Mail className="w-5 h-5" />} type="email"
                placeholder="email@example.com" value={form.email} error={touched.email ? errors.email : undefined}
                autoComplete="email"
                onChange={handleChange} onBlur={handleBlur}
              />
            </div>

            {/* Phone */}
            <InputField
              id="phone" name="phone" label="Số điện thoại (tuỳ chọn)" icon={<Phone className="w-5 h-5" />}
              placeholder="0912345678" value={form.phone || ''} error={touched.phone ? errors.phone : undefined}
              type="tel"
              onChange={handleChange} onBlur={handleBlur}
            />

            {/* Password */}
            <InputField
              id="password" name="password" label="Mật khẩu" icon={<Lock className="w-5 h-5" />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Ít nhất 6 ký tự" value={form.password} error={touched.password ? errors.password : undefined}
              autoComplete="new-password"
              onChange={handleChange} onBlur={handleBlur}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            {/* Confirm Password */}
            <InputField
              id="confirmPassword" name="confirmPassword" label="Xác nhận mật khẩu" icon={<ShieldCheck className="w-5 h-5" />}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu" value={form.confirmPassword} error={touched.confirmPassword ? errors.confirmPassword : undefined}
              autoComplete="new-password"
              onChange={handleChange} onBlur={handleBlur}
              rightElement={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-coffee-400 hover:text-coffee-300 font-medium transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
