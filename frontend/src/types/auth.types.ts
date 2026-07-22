// Auth types matching backend DTOs

export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface UserRequest {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  status: UserStatus;
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
