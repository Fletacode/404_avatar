export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin?: boolean;
  // 설문조사 정보 (회원가입 시 입력)
  birthDate?: string;
  relationshipToDeceased?: string;
  relationshipDescription?: string;
  psychologicalSupportLevel?: string;
  meetingParticipationDesire?: boolean;
  personalNotes?: string;
  privacyAgreement?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // 설문조사 관련 필드들
  birthDate?: string;
  relationshipToDeceased?: string;
  relationshipDescription?: string;
  psychologicalSupportLevel?: string;
  meetingParticipationDesire?: boolean;
  personalNotes?: string;
  privacyAgreement?: boolean;
}
