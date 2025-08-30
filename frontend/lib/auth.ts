import type { User, LoginData, RegisterData } from '@/types/auth';
import { authApi, ApiError } from './api';

export const authService = {
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  login: async (data: LoginData): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const response = await authApi.login({
        username: data.email, // 백엔드에서는 username을 사용
        password: data.password,
      });

      localStorage.setItem('token', response.access_token);
      
      const user: User = {
        id: response.user.id.toString(),
        username: response.user.username,
        email: response.user.email || data.email,
        createdAt: response.user.createdAt,
        isAdmin: response.user.isAdmin,
      };
      
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, message: '로그인 성공', user };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '로그인에 실패했습니다.';
      return { success: false, message };
    }
  },

  register: async (data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      if (data.password !== data.confirmPassword) {
        return { success: false, message: '비밀번호가 일치하지 않습니다.' };
      }

      const response = await authApi.register({
        username: data.username,
        password: data.password,
        name: data.username, // name 필드 추가
        email: data.email,
      });

      localStorage.setItem('token', response.access_token);
      
      const user: User = {
        id: response.user.id.toString(),
        username: response.user.username,
        email: response.user.email,
        createdAt: response.user.createdAt,
        isAdmin: response.user.isAdmin,
      };
      
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, message: '회원가입 성공', user };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '회원가입에 실패했습니다.';
      return { success: false, message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};