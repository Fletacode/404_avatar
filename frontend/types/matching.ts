// 상담사 관련 타입들
export enum CounselorSpecialty {
  GRIEF_COUNSELING = 'GRIEF_COUNSELING',
  FAMILY_THERAPY = 'FAMILY_THERAPY',
  TRAUMA_THERAPY = 'TRAUMA_THERAPY',
  GROUP_THERAPY = 'GROUP_THERAPY',
  CHILD_COUNSELING = 'CHILD_COUNSELING',
  ELDERLY_COUNSELING = 'ELDERLY_COUNSELING'
}

export enum CounselorStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE'
}

export enum RelationshipToDeceased {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER'
}

export enum PsychologicalSupportLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE'
}

export enum AgeGroup {
  CHILD = 'CHILD',      // 0-18세
  YOUNG_ADULT = 'YOUNG_ADULT',  // 19-35세
  MIDDLE_AGED = 'MIDDLE_AGED',  // 36-55세
  SENIOR = 'SENIOR'     // 56세 이상
}

export enum MeetingType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID'
}

export enum FamilyGroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL'
}

export interface Counselor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  specialty: CounselorSpecialty;
  specializedRelationships: RelationshipToDeceased[];
  supportLevels: PsychologicalSupportLevel[];
  specializedAgeGroups: AgeGroup[];
  introduction: string;
  education?: string;
  experience?: string;
  experienceYears: number;
  rating: number;
  totalReviews: number;
  status: CounselorStatus;
  profileImage?: string;
  maxClientsPerDay: number;
  currentClientsToday: number;
  createdAt: string;
  updatedAt: string;
  matchScore?: number; // 추천 상담사에서 사용
}

// 매칭 관련 타입들
export enum MatchingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MatchingType {
  COUNSELOR = 'COUNSELOR',
  FAMILY_GROUP = 'FAMILY_GROUP'
}

// 유가족 그룹 인터페이스
export interface FamilyGroup {
  id: number;
  name: string;
  description: string;
  location: string;
  meetingType: MeetingType;
  targetRelationships: RelationshipToDeceased[];
  targetAgeGroups: AgeGroup[];
  maxMembers: number;
  currentMembers: number;
  nextMeetingDate: string;
  leaderName: string;
  leaderEmail?: string;
  leaderPhone?: string;
  status: FamilyGroupStatus;
  meetingDetails?: string;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
  matchScore?: number; // 추천 그룹에서 사용
}

export interface Matching {
  id: number;
  type: MatchingType;
  status: MatchingStatus;
  matchScore: number;
  notes?: string;
  rejectionReason?: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  counselorId?: number;
  counselor?: Counselor;
  familyGroupId?: number;
  familyGroup?: FamilyGroup;
}

// API 요청/응답 타입들
export interface CreateMatchingRequest {
  counselorId: number;
  notes?: string;
}

export interface UpdateMatchingRequest {
  status: MatchingStatus;
  notes?: string;
  rejectionReason?: string;
}

// 상담사 전문분야 라벨
export const CounselorSpecialtyLabels: Record<CounselorSpecialty, string> = {
  [CounselorSpecialty.GRIEF_COUNSELING]: '애도상담',
  [CounselorSpecialty.FAMILY_THERAPY]: '가족치료',
  [CounselorSpecialty.TRAUMA_THERAPY]: '트라우마치료',
  [CounselorSpecialty.GROUP_THERAPY]: '집단상담',
  [CounselorSpecialty.CHILD_COUNSELING]: '아동상담',
  [CounselorSpecialty.ELDERLY_COUNSELING]: '노인상담'
};

// 상담사 상태 라벨
export const CounselorStatusLabels: Record<CounselorStatus, string> = {
  [CounselorStatus.AVAILABLE]: '상담가능',
  [CounselorStatus.BUSY]: '상담중',
  [CounselorStatus.UNAVAILABLE]: '상담불가'
};

// 매칭 상태 라벨
export const MatchingStatusLabels: Record<MatchingStatus, string> = {
  [MatchingStatus.PENDING]: '대기중',
  [MatchingStatus.ACCEPTED]: '승인됨',
  [MatchingStatus.REJECTED]: '거부됨',
  [MatchingStatus.COMPLETED]: '완료됨',
  [MatchingStatus.CANCELLED]: '취소됨'
};

// 관계 라벨
export const RelationshipLabels: Record<RelationshipToDeceased, string> = {
  [RelationshipToDeceased.SPOUSE]: '배우자',
  [RelationshipToDeceased.CHILD]: '자녀',
  [RelationshipToDeceased.PARENT]: '부모',
  [RelationshipToDeceased.SIBLING]: '형제자매',
  [RelationshipToDeceased.OTHER]: '기타'
};

// 심리적 지원 수준 라벨
export const SupportLevelLabels: Record<PsychologicalSupportLevel, string> = {
  [PsychologicalSupportLevel.HIGH]: '높음',
  [PsychologicalSupportLevel.MEDIUM]: '보통',
  [PsychologicalSupportLevel.LOW]: '낮음',
  [PsychologicalSupportLevel.NONE]: '없음'
};
