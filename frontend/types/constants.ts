export const RelationshipToDeceased = {
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD', 
  PARENT: 'PARENT',
  SIBLING: 'SIBLING',
  OTHER: 'OTHER'
} as const;

export const PsychologicalSupportLevel = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  NONE: 'NONE'
} as const;

export const RELATIONSHIP_LABELS = {
  [RelationshipToDeceased.SPOUSE]: '배우자',
  [RelationshipToDeceased.CHILD]: '자녀',
  [RelationshipToDeceased.PARENT]: '부모',
  [RelationshipToDeceased.SIBLING]: '형제자매',
  [RelationshipToDeceased.OTHER]: '기타',
};

export const SUPPORT_LEVEL_LABELS = {
  [PsychologicalSupportLevel.HIGH]: '높음 (전문적인 상담이 시급히 필요)',
  [PsychologicalSupportLevel.MEDIUM]: '보통 (일부 지원이 도움이 될 것)',
  [PsychologicalSupportLevel.LOW]: '낮음 (현재는 큰 어려움이 없음)',
  [PsychologicalSupportLevel.NONE]: '없음 (지원이 필요하지 않음)',
};
