import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { AuthResponse, UserResponse } from '../types/auth.types';
import { TOKEN_KEY } from '../api/axiosInstance';

const USER_KEY = 'cms_user';

interface AuthContextType {
  user:            UserResponse | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (authResponse: AuthResponse) => void;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token,     setToken]     = useState<string | null>(null);
  const [user,      setUser]      = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        // Decode JWT payload (base64url) to check expiry — không cần thư viện ngoài
        const payloadBase64 = storedToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
          const isExpired = payload.exp && Date.now() >= payload.exp * 1000;
          if (isExpired) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((authResponse: AuthResponse) => {
    const userInfo: UserResponse = {
      id:        authResponse.userId,
      username:  authResponse.username,
      fullName:  authResponse.fullName,
      email:     authResponse.email,
      role:      authResponse.role,
      status:    'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    setToken(authResponse.accessToken);
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
};

export default AuthContext;
