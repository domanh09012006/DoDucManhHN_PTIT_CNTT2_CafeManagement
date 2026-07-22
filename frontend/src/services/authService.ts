import axiosInstance from '../api/axiosInstance';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../types/auth.types';

const AuthService = {
  /**
   * UC01 – Đăng nhập
   */
  login: async (request: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      request
    );
    return response.data;
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (request: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.post<ApiResponse<UserResponse>>(
      '/api/auth/register',
      request
    );
    return response.data;
  },

  /**
   * UC02 – Đăng xuất
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout');
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.get<ApiResponse<UserResponse>>('/api/auth/me');
    return response.data;
  },
};

export default AuthService;
