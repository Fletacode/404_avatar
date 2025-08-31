import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Counselor, CounselorStatus, AgeGroup } from '../entities/counselor.entity';
import { Matching, MatchingStatus, MatchingType } from '../entities/matching.entity';
import { User } from '../entities/user.entity';
import { FamilyGroup, FamilyGroupStatus } from '../entities/family-group.entity';
import { RelationshipToDeceased, PsychologicalSupportLevel } from '../entities/family-survey.entity';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Counselor)
    private counselorRepository: Repository<Counselor>,
    @InjectRepository(Matching)
    private matchingRepository: Repository<Matching>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FamilyGroup)
    private familyGroupRepository: Repository<FamilyGroup>,
  ) {}

  async findMatchingCounselors(userId: number): Promise<Counselor[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자의 설문조사 정보를 기반으로 상담사 매칭
    const availableCounselors = await this.counselorRepository.find({
      where: { status: CounselorStatus.AVAILABLE },
      order: { rating: 'DESC', experienceYears: 'DESC' }
    });

    // 매칭 점수 계산 및 정렬
    const counselorsWithScore = availableCounselors.map(counselor => {
      const score = this.calculateMatchScore(user, counselor);
      return { ...counselor, matchScore: score };
    });

    // 점수순으로 정렬 후 상위 10명 반환 (더 많은 선택지 제공)
    return counselorsWithScore
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  private calculateMatchScore(user: User, counselor: Counselor): number {
    let score = 0;

    // 기본 점수: 상담사의 평점과 경험 연수
    score += counselor.rating * 15; // 평점 (최대 75점)
    score += Math.min(counselor.experienceYears, 15) * 2; // 경험 연수 (최대 30점)

    // 관계 매칭 점수 (가중치 강화)
    try {
      const specializedRelationships = JSON.parse(counselor.specializedRelationships);
      if (user.relationshipToDeceased && 
          specializedRelationships.includes(user.relationshipToDeceased)) {
        score += 40; // 관계 전문성 매칭 (40점)
        
        // 특별한 관계별 추가 점수
        if (user.relationshipToDeceased === 'CHILD') {
          score += 10; // 자녀 상실은 특히 어려운 경우
        } else if (user.relationshipToDeceased === 'SPOUSE') {
          score += 8; // 배우자 상실도 높은 점수
        }
      }
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }

    // 심리적 지원 수준 매칭 점수
    try {
      const supportLevels = JSON.parse(counselor.supportLevels);
      if (user.psychologicalSupportLevel && 
          supportLevels.includes(user.psychologicalSupportLevel)) {
        score += 30; // 지원 수준 매칭 (30점)
        
        // 높은 지원 수준 필요시 추가 점수
        if (user.psychologicalSupportLevel === 'HIGH') {
          score += 10;
        }
      }
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }

    // 연령대 매칭 점수
    if (user.birthDate) {
      const userAgeGroup = this.getUserAgeGroup(user.birthDate);
      try {
        const specializedAgeGroups = JSON.parse(counselor.specializedAgeGroups);
        if (specializedAgeGroups.includes(userAgeGroup)) {
          score += 25; // 연령대 전문성 매칭 (25점)
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }

    // 전문 분야별 매칭 보너스
    if (user.relationshipToDeceased && user.birthDate) {
      const userAgeGroup = this.getUserAgeGroup(user.birthDate);
      score += this.getSpecialtyBonus(counselor.specialty, user.relationshipToDeceased, userAgeGroup);
    }

    // 현재 업무량 고려 (여유있는 상담사에게 가산점)
    const workloadRatio = counselor.currentClientsToday / Math.max(counselor.maxClientsPerDay, 1);
    score += (1 - workloadRatio) * 15; // 업무량 여유도 (최대 15점)

    // 리뷰 수에 따른 신뢰도 점수
    if (counselor.totalReviews > 50) {
      score += 10; // 충분한 리뷰가 있는 경험 많은 상담사
    } else if (counselor.totalReviews > 20) {
      score += 5;
    }

    return Math.round(score);
  }

  private getSpecialtyBonus(specialty: string, relationship: string, ageGroup: AgeGroup): number {
    let bonus = 0;

    // 전문 분야별 특화 보너스
    switch (specialty) {
      case 'CHILD_COUNSELING':
        if (ageGroup === AgeGroup.CHILD || ageGroup === AgeGroup.YOUNG_ADULT) {
          bonus += 15;
        }
        if (relationship === 'PARENT') {
          bonus += 10; // 부모를 잃은 아동/청소년
        }
        break;
        
      case 'ELDERLY_COUNSELING':
        if (ageGroup === AgeGroup.SENIOR) {
          bonus += 15;
        }
        if (relationship === 'SPOUSE' || relationship === 'CHILD') {
          bonus += 10; // 노인의 배우자/자녀 상실
        }
        break;
        
      case 'FAMILY_THERAPY':
        if (relationship === 'CHILD' || relationship === 'SIBLING') {
          bonus += 12; // 가족 구성원 상실
        }
        break;
        
      case 'TRAUMA_THERAPY':
        if (relationship === 'OTHER') {
          bonus += 15; // 예상치 못한 상실
        }
        break;
        
      case 'GRIEF_COUNSELING':
        // 애도상담은 모든 경우에 기본적으로 적합
        bonus += 8;
        break;
        
      case 'GROUP_THERAPY':
        // 집단상담은 사회적 지지가 필요한 경우에 적합
        bonus += 5;
        break;
    }

    return bonus;
  }

  private getUserAgeGroup(birthDate: Date): AgeGroup {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // 생일이 지나지 않았으면 나이에서 1을 뺌
    const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

    if (adjustedAge <= 18) {
      return AgeGroup.CHILD;
    } else if (adjustedAge <= 35) {
      return AgeGroup.YOUNG_ADULT;
    } else if (adjustedAge <= 55) {
      return AgeGroup.MIDDLE_AGED;
    } else {
      return AgeGroup.SENIOR;
    }
  }

  async createMatching(userId: number, counselorId: number): Promise<Matching> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const counselor = await this.counselorRepository.findOne({ where: { id: counselorId } });
    if (!counselor) {
      throw new NotFoundException('상담사를 찾을 수 없습니다.');
    }

    if (counselor.status !== CounselorStatus.AVAILABLE) {
      throw new BadRequestException('해당 상담사는 현재 상담이 불가능합니다.');
    }

    // 이미 진행 중인 매칭이 있는지 확인
    const existingMatching = await this.matchingRepository.findOne({
      where: {
        userId,
        counselorId,
        status: MatchingStatus.PENDING
      }
    });

    if (existingMatching) {
      throw new BadRequestException('이미 해당 상담사와 매칭 요청이 진행 중입니다.');
    }

    const matchScore = this.calculateMatchScore(user, counselor);

    const matching = this.matchingRepository.create({
      type: MatchingType.COUNSELOR,
      status: MatchingStatus.PENDING,
      matchScore,
      userId,
      counselorId,
      user,
      counselor
    });

    return await this.matchingRepository.save(matching);
  }

  async getUserMatchings(userId: number): Promise<Matching[]> {
    return await this.matchingRepository.find({
      where: { userId },
      relations: ['counselor'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateMatchingStatus(
    matchingId: number, 
    status: MatchingStatus, 
    notes?: string
  ): Promise<Matching> {
    const matching = await this.matchingRepository.findOne({
      where: { id: matchingId },
      relations: ['counselor']
    });

    if (!matching) {
      throw new NotFoundException('매칭을 찾을 수 없습니다.');
    }

    matching.status = status;
    if (notes) {
      matching.notes = notes;
    }

    if (status === MatchingStatus.COMPLETED) {
      matching.completedAt = new Date();
    }

    return await this.matchingRepository.save(matching);
  }

  async getAllCounselors(): Promise<Counselor[]> {
    return await this.counselorRepository.find({
      order: { rating: 'DESC', experienceYears: 'DESC' }
    });
  }

  async getCounselorById(id: number): Promise<Counselor> {
    const counselor = await this.counselorRepository.findOne({ where: { id } });
    if (!counselor) {
      throw new NotFoundException('상담사를 찾을 수 없습니다.');
    }
    return counselor;
  }

  // 유가족 그룹 관련 메서드들
  async findMatchingFamilyGroups(userId: number): Promise<FamilyGroup[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 활성 상태이고 정원이 차지 않은 유가족 그룹들을 조회
    const availableGroups = await this.familyGroupRepository.find({
      where: { 
        status: FamilyGroupStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' }
    });

    // 정원이 찬 그룹들 필터링
    const activeGroups = availableGroups.filter(group => group.currentMembers < group.maxMembers);

    // 매칭 점수 계산 및 정렬
    const groupsWithScore = activeGroups.map(group => {
      const score = this.calculateFamilyGroupMatchScore(user, group);
      return { ...group, matchScore: score };
    });

    // 점수순으로 정렬 후 상위 10개 반환
    return groupsWithScore
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  private calculateFamilyGroupMatchScore(user: User, group: FamilyGroup): number {
    let score = 0;

    // 기본 점수: 모임의 활성도와 크기
    score += 20; // 기본 점수

    // 관계 매칭 점수
    try {
      const targetRelationships = JSON.parse(group.targetRelationships);
      if (user.relationshipToDeceased && 
          targetRelationships.includes(user.relationshipToDeceased)) {
        score += 40; // 대상 관계 매칭 (40점)
      }
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }

    // 연령대 매칭 점수
    if (user.birthDate) {
      const userAgeGroup = this.getUserAgeGroup(user.birthDate);
      try {
        const targetAgeGroups = JSON.parse(group.targetAgeGroups);
        if (targetAgeGroups.includes(userAgeGroup)) {
          score += 30; // 연령대 매칭 (30점)
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
    }

    // 모임 규모에 따른 점수 (적당한 크기의 모임에 가산점)
    const memberRatio = group.currentMembers / group.maxMembers;
    if (memberRatio >= 0.3 && memberRatio <= 0.8) {
      score += 15; // 적당한 참여도의 모임
    }

    // 다음 모임일정이 있으면 가산점
    if (group.nextMeetingDate && new Date(group.nextMeetingDate) > new Date()) {
      score += 10;
    }

    return Math.round(score);
  }

  async getAllFamilyGroups(): Promise<FamilyGroup[]> {
    return await this.familyGroupRepository.find({
      where: { status: FamilyGroupStatus.ACTIVE },
      order: { createdAt: 'DESC' }
    });
  }

  async getFamilyGroupById(id: number): Promise<FamilyGroup> {
    const group = await this.familyGroupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('유가족 그룹을 찾을 수 없습니다.');
    }
    return group;
  }

  async createFamilyMatching(userId: number, familyGroupId: number): Promise<Matching> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const familyGroup = await this.familyGroupRepository.findOne({ where: { id: familyGroupId } });
    if (!familyGroup) {
      throw new NotFoundException('유가족 그룹을 찾을 수 없습니다.');
    }

    if (familyGroup.status !== FamilyGroupStatus.ACTIVE) {
      throw new BadRequestException('해당 그룹은 현재 활성화되지 않았습니다.');
    }

    if (familyGroup.currentMembers >= familyGroup.maxMembers) {
      throw new BadRequestException('해당 그룹의 정원이 가득 찼습니다.');
    }

    // 이미 진행 중인 매칭이 있는지 확인
    const existingMatching = await this.matchingRepository.findOne({
      where: {
        userId,
        familyGroupId,
        status: MatchingStatus.PENDING
      }
    });

    if (existingMatching) {
      throw new BadRequestException('이미 해당 그룹에 참가 신청이 진행 중입니다.');
    }

    const matchScore = this.calculateFamilyGroupMatchScore(user, familyGroup);

    const matching = this.matchingRepository.create({
      type: MatchingType.FAMILY_GROUP,
      status: MatchingStatus.PENDING,
      matchScore,
      userId,
      familyGroupId,
      user,
      familyGroup
    });

    return await this.matchingRepository.save(matching);
  }

  async getUserFamilyMatchings(userId: number): Promise<Matching[]> {
    return await this.matchingRepository.find({
      where: { 
        userId,
        type: MatchingType.FAMILY_GROUP 
      },
      relations: ['familyGroup'],
      order: { createdAt: 'DESC' }
    });
  }
}
