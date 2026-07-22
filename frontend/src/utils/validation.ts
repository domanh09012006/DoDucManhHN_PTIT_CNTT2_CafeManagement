export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) return 'Email không được để trống';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Email không đúng định dạng';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) return 'Số điện thoại không được để trống';
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8,9}$/;
  if (!phoneRegex.test(phone.trim())) return 'Số điện thoại không hợp lệ (9-11 chữ số)';
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username || !username.trim()) return 'Tên đăng nhập không được để trống';
  const u = username.trim();
  if (u.length < 3 || u.length > 20) return 'Tên đăng nhập phải từ 3 đến 20 ký tự';
  const usernameRegex = /^[a-zA-Z0-9_.]+$/;
  if (!usernameRegex.test(u)) return 'Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới và dấu chấm';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Mật khẩu không được để trống';
  if (password.length < 6 || password.length > 30) return 'Mật khẩu phải từ 6 đến 30 ký tự';
  return null;
};

export const cleanWhitespace = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.trim();
};
