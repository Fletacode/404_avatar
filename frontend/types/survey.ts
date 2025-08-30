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

export interface FamilySurvey {
  id: number;
  user: {
    id: number;
    username: string;
    name: string;
  };
  birthDate: string;
  relationshipToDeceased: RelationshipToDeceased;
  relationshipDescription?: string;
  psychologicalSupportLevel: PsychologicalSupportLevel;
  meetingParticipationDesire: boolean;
  personalNotes?: string;
  privacyAgreement: boolean;
  surveyCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitSurveyData {
  birthDate: string;
  relationshipToDeceased: RelationshipToDeceased;
  relationshipDescription?: string;
  psychologicalSupportLevel: PsychologicalSupportLevel;
  meetingParticipationDesire: boolean;
  personalNotes?: string;
  privacyAgreement: boolean;
  surveyCompleted?: boolean;
}

export interface SurveyStatistics {
  total: number;
  relationshipStats: Array<{ relationship: string; count: number }>;
  supportLevelStats: Array<{ supportLevel: string; count: number }>;
  meetingParticipationStats: Array<{ desire: boolean; count: number }>;
}
