// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API 에러 처리
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// API 호출 헬퍼
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || 'API Error');
  }

  return response.json();
}

// 인증된 API 호출
async function authenticatedApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  return apiCall<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

// 인증 API
export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiCall<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { username: string; password: string; name: string; email: string }) =>
    apiCall<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    authenticatedApiCall<any>('/auth/profile'),
};

// 게시판 API
export const boardApi = {
  getBoards: (categoryId?: number) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return apiCall<any[]>(`/boards${params}`);
  },

  getBoard: (id: number) =>
    apiCall<any>(`/boards/${id}`),

  createBoard: (data: { title: string; content: string; author: string; categoryId: number; isAdminPost?: boolean }) =>
    authenticatedApiCall<any>('/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBoard: (id: number, data: Partial<{ title: string; content: string; categoryId: number; isAdminPost: boolean }>) =>
    authenticatedApiCall<any>(`/boards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteBoard: (id: number) =>
    authenticatedApiCall<void>(`/boards/${id}`, {
      method: 'DELETE',
    }),
};

// 카테고리 API
export const categoryApi = {
  getCategories: () =>
    apiCall<any[]>('/categories'),

  getCategory: (id: number) =>
    apiCall<any>(`/categories/${id}`),

  createCategory: (data: { name: string; description: string }) =>
    authenticatedApiCall<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: number, data: Partial<{ name: string; description: string }>) =>
    authenticatedApiCall<any>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: number) =>
    authenticatedApiCall<void>(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// 설문조사 API
export const surveyApi = {
  submitSurvey: (data: {
    birthDate: string;
    relationshipToDeceased: string;
    relationshipDescription?: string;
    psychologicalSupportLevel: string;
    meetingParticipationDesire: boolean;
    personalNotes?: string;
    privacyAgreement: boolean;
    surveyCompleted?: boolean;
  }) =>
    authenticatedApiCall<any>('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMySurvey: () =>
    authenticatedApiCall<any>('/surveys/my-survey'),

  updateMySurvey: (data: any) =>
    authenticatedApiCall<any>('/surveys/my-survey', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMySurvey: () =>
    authenticatedApiCall<void>('/surveys/my-survey', {
      method: 'DELETE',
    }),

  getAllSurveys: () =>
    authenticatedApiCall<any[]>('/surveys/all'),

  getStatistics: () =>
    authenticatedApiCall<any>('/surveys/statistics'),
};
