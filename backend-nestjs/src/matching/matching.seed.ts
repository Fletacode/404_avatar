import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Counselor, CounselorSpecialty, CounselorStatus } from '../entities/counselor.entity';
import { RelationshipToDeceased, PsychologicalSupportLevel } from '../entities/family-survey.entity';

@Injectable()
export class MatchingSeedService {
  constructor(
    @InjectRepository(Counselor)
    private counselorRepository: Repository<Counselor>,
  ) {}

  async seedCounselors() {
    const existingCounselors = await this.counselorRepository.count();
    if (existingCounselors > 0) {
      console.log('상담사 데이터가 이미 존재합니다.');
      return;
    }

    const counselors = [
      {
        name: '김미영',
        email: 'kim.miyoung@example.com',
        phone: '010-1234-5678',
        licenseNumber: 'COUN-2020-001',
        specialty: CounselorSpecialty.GRIEF_COUNSELING,
        specializedRelationships: JSON.stringify([RelationshipToDeceased.SPOUSE, RelationshipToDeceased.PARENT]),
        supportLevels: JSON.stringify([PsychologicalSupportLevel.HIGH, PsychologicalSupportLevel.MEDIUM]),
        introduction: '20년 경력의 애도상담 전문가로, 배우자나 부모를 잃은 분들의 상담을 전문으로 합니다.',
        education: '서울대학교 심리학과 박사',
        experience: '서울대병원 정신건강의학과, 한국애도상담센터 수석상담사',
        experienceYears: 20,
        rating: 4.9,
        totalReviews: 156,
        status: CounselorStatus.AVAILABLE,
        maxClientsPerDay: 8,
        currentClientsToday: 2
      },
      {
        name: '박정호',
        email: 'park.jungho@example.com',
        phone: '010-2345-6789',
        licenseNumber: 'COUN-2019-002',
        specialty: CounselorSpecialty.FAMILY_THERAPY,
        specializedRelationships: JSON.stringify([RelationshipToDeceased.CHILD, RelationshipToDeceased.SIBLING]),
        supportLevels: JSON.stringify([PsychologicalSupportLevel.HIGH, PsychologicalSupportLevel.MEDIUM, PsychologicalSupportLevel.LOW]),
        introduction: '가족치료 전문가로 자녀나 형제자매를 잃은 가족들의 회복을 돕습니다.',
        education: '연세대학교 상담심리학과 박사',
        experience: '연세세브란스병원, 가족상담센터 원장',
        experienceYears: 15,
        rating: 4.8,
        totalReviews: 98,
        status: CounselorStatus.AVAILABLE,
        maxClientsPerDay: 6,
        currentClientsToday: 1
      },
      {
        name: '이소영',
        email: 'lee.soyoung@example.com',
        phone: '010-3456-7890',
        licenseNumber: 'COUN-2021-003',
        specialty: CounselorSpecialty.TRAUMA_THERAPY,
        specializedRelationships: JSON.stringify([RelationshipToDeceased.OTHER]),
        supportLevels: JSON.stringify([PsychologicalSupportLevel.HIGH]),
        introduction: '트라우마 치료 전문가로 갑작스런 상실을 경험한 분들을 도와드립니다.',
        education: '고려대학교 임상심리학과 박사',
        experience: '국립정신건강센터, 트라우마센터',
        experienceYears: 12,
        rating: 4.7,
        totalReviews: 73,
        status: CounselorStatus.AVAILABLE,
        maxClientsPerDay: 5,
        currentClientsToday: 0
      },
      {
        name: '최민수',
        email: 'choi.minsu@example.com',
        phone: '010-4567-8901',
        licenseNumber: 'COUN-2018-004',
        specialty: CounselorSpecialty.GROUP_THERAPY,
        specializedRelationships: JSON.stringify([RelationshipToDeceased.SPOUSE, RelationshipToDeceased.CHILD, RelationshipToDeceased.PARENT]),
        supportLevels: JSON.stringify([PsychologicalSupportLevel.MEDIUM, PsychologicalSupportLevel.LOW]),
        introduction: '집단상담 전문가로 유가족 자조모임을 이끌며 서로의 경험을 나누도록 돕습니다.',
        education: '부산대학교 상담학과 박사',
        experience: '부산시 정신건강센터, 유가족지원센터',
        experienceYears: 18,
        rating: 4.6,
        totalReviews: 124,
        status: CounselorStatus.AVAILABLE,
        maxClientsPerDay: 10,
        currentClientsToday: 3
      },
      {
        name: '황지은',
        email: 'hwang.jieun@example.com',
        phone: '010-5678-9012',
        licenseNumber: 'COUN-2022-005',
        specialty: CounselorSpecialty.CHILD_COUNSELING,
        specializedRelationships: JSON.stringify([RelationshipToDeceased.PARENT]),
        supportLevels: JSON.stringify([PsychologicalSupportLevel.MEDIUM, PsychologicalSupportLevel.LOW, PsychologicalSupportLevel.NONE]),
        introduction: '아동·청소년 상담 전문가로 부모를 잃은 어린이들의 마음을 치유합니다.',
        education: '이화여자대학교 아동학과 박사',
        experience: '서울아동병원, 청소년상담센터',
        experienceYears: 8,
        rating: 4.8,
        totalReviews: 45,
        status: CounselorStatus.AVAILABLE,
        maxClientsPerDay: 6,
        currentClientsToday: 1
      }
    ];

    for (const counselorData of counselors) {
      const counselor = this.counselorRepository.create(counselorData);
      await this.counselorRepository.save(counselor);
    }

    console.log('상담사 샘플 데이터가 성공적으로 추가되었습니다.');
  }
}
