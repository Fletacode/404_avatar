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
  
  console.log('=== Frontend API Call ===');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', {
    'Content-Type': 'application/json',
    ...options.headers,
  });
  console.log('Body:', options.body);
  console.log('============================');

  try {
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
  } catch (error) {
    // fetch 자체가 실패한 경우 (네트워크 오류, CORS 오류 등)
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        throw new ApiError(0, '백엔드 서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      }
    }
    
    // 이미 ApiError인 경우 그대로 전달
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 기타 오류
    throw new ApiError(500, '알 수 없는 오류가 발생했습니다.');
  }
}

// 인증된 API 호출
async function authenticatedApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  console.log('=== Frontend Authenticated API Call ===');
  console.log('Token from localStorage:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token found');
  console.log('Endpoint:', endpoint);
  console.log('======================================');
  
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

  register: (data: { 
    username: string; 
    password: string; 
    name: string; 
    email: string;
    birthDate?: string;
    relationshipToDeceased?: string;
    relationshipDescription?: string;
    psychologicalSupportLevel?: string;
    meetingParticipationDesire?: boolean;
    personalNotes?: string;
    privacyAgreement?: boolean;
  }) =>
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
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any>('/boards', {
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

// 댓글 API
export const commentApi = {
  getCommentsByBoardId: (boardId: number) =>
    apiCall<any[]>(`/comments/board/${boardId}`),

  createComment: (data: { content: string; author: string; boardId: number }) =>
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateComment: (id: number, data: { content: string }) =>
    apiCall<any>(`/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteComment: (id: number) =>
    apiCall<void>(`/comments/${id}`, {
      method: 'DELETE',
    }),

  getCommentCount: (boardId: number) =>
    apiCall<number>(`/comments/count/${boardId}`),
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
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any>('/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMySurvey: () =>
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any>('/surveys/my-survey'),

  updateMySurvey: (data: any) =>
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any>('/surveys/my-survey', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMySurvey: () =>
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<void>('/surveys/my-survey', {
      method: 'DELETE',
    }),

  getAllSurveys: () =>
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any[]>('/surveys/all'),

  getStatistics: () =>
    // 임시로 인증 없이 요청 (JWT 문제 해결 후 authenticatedApiCall로 복원)
    apiCall<any>('/surveys/statistics'),
};
