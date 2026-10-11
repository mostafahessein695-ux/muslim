import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  adminUser: UserProfile | null;
  token: string | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  mustChangeAdminPassword: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    whatsappConsent?: boolean;
  }) => Promise<{ success: boolean; error?: string; notifications?: any }>;
  loginWithGoogle: (email: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithApple: (email?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  adminChangePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kd_customer_token'));
  
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('kd_admin_token'));
  const [mustChangeAdminPassword, setMustChangeAdminPassword] = useState<boolean>(() => {
    return localStorage.getItem('kd_admin_must_change') === 'true';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate user session
  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('kd_customer_token');
            setToken(null);
            setUser(null);
          }
        } catch {
          // offline or error
        }
      }

      if (adminToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user.role === 'admin') {
              setAdminUser(data.user);
              if (data.user.mustChangePassword) {
                setMustChangeAdminPassword(true);
              }
            } else {
              adminLogout();
            }
          } else {
            adminLogout();
          }
        } catch {
          // offline or error
        }
      }
      setIsLoading(false);
    }

    loadSessions();
  }, [token, adminToken]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      localStorage.setItem('kd_customer_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred.' };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    whatsappConsent?: boolean;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      localStorage.setItem('kd_customer_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, notifications: data.notifications };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred.' };
    }
  };

  const loginWithGoogle = async (email: string, name: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, googleId: `g_${Date.now()}` })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google login failed.' };
      }
      localStorage.setItem('kd_customer_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const loginWithApple = async (email?: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Apple login failed.' };
      }
      localStorage.setItem('kd_customer_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('kd_customer_token');
    setToken(null);
    setUser(null);
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Admin login failed.' };
      }
      localStorage.setItem('kd_admin_token', data.token);
      setAdminToken(data.token);
      setAdminUser(data.admin);
      setMustChangeAdminPassword(Boolean(data.mustChangePassword));
      if (data.mustChangePassword) {
        localStorage.setItem('kd_admin_must_change', 'true');
      } else {
        localStorage.removeItem('kd_admin_must_change');
      }
      return {
        success: true,
        mustChangePassword: Boolean(data.mustChangePassword)
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred.' };
    }
  };

  const adminChangePassword = async (currentPassword: string, newPassword: string) => {
    if (!adminToken) return { success: false, error: 'Unauthorized.' };
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password update failed.' };
      }
      setMustChangeAdminPassword(false);
      localStorage.removeItem('kd_admin_must_change');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('kd_admin_token');
    localStorage.removeItem('kd_admin_must_change');
    setAdminToken(null);
    setAdminUser(null);
    setMustChangeAdminPassword(false);
  };

  const refreshProfile = async () => {
    if (token) {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        token,
        adminToken,
        isAuthenticated: Boolean(user),
        isAdminAuthenticated: Boolean(adminUser),
        mustChangeAdminPassword,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        logout,
        adminLogin,
        adminChangePassword,
        adminLogout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
