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
      console.error('Login error:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
        } else if (error.status === 404) {
          return { success: false, message: '사용자를 찾을 수 없습니다. 회원가입을 먼저 진행해주세요.' };
        } else if (error.status === 0 || error.status >= 500) {
          return { success: false, message: '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.' };
        } else {
          return { success: false, message: `로그인 오류: ${error.message}` };
        }
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { success: false, message: '백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.' };
      }
      
      return { success: false, message: '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' };
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
      console.error('Register error:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 409) {
          return { success: false, message: '이미 존재하는 사용자명 또는 이메일입니다.' };
        } else if (error.status === 400) {
          return { success: false, message: '입력 정보가 올바르지 않습니다. 다시 확인해주세요.' };
        } else if (error.status === 0 || error.status >= 500) {
          return { success: false, message: '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.' };
        } else {
          return { success: false, message: `회원가입 오류: ${error.message}` };
        }
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { success: false, message: '백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.' };
      }
      
      return { success: false, message: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.' };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};