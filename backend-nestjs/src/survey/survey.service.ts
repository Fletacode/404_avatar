import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilySurvey } from '../entities/family-survey.entity';
import { User } from '../entities/user.entity';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(FamilySurvey)
    private familySurveyRepository: Repository<FamilySurvey>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitSurvey(submitSurveyDto: SubmitSurveyDto, userId: number): Promise<FamilySurvey> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 기존 설문조사가 있는지 확인
    const existingSurvey = await this.familySurveyRepository.findOne({ 
      where: { user: { id: userId } } 
    });

    if (existingSurvey) {
      throw new ConflictException('이미 설문조사를 완료했습니다.');
    }

    const survey = this.familySurveyRepository.create({
      ...submitSurveyDto,
      birthDate: new Date(submitSurveyDto.birthDate),
      user,
    });

    return this.familySurveyRepository.save(survey);
  }

  async findByUserId(userId: number): Promise<FamilySurvey | null> {
    return this.familySurveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.user', 'user')
      .where('survey.user.id = :userId', { userId })
      .getOne();
  }

  async findAll(): Promise<FamilySurvey[]> {
    return this.familySurveyRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.user', 'user')
      .orderBy('survey.createdAt', 'DESC')
      .getMany();
  }

  async updateSurvey(userId: number, updateSurveyDto: Partial<SubmitSurveyDto>): Promise<FamilySurvey> {
    const survey = await this.findByUserId(userId);
    if (!survey) {
      throw new NotFoundException('설문조사를 찾을 수 없습니다.');
    }

    if (updateSurveyDto.birthDate) {
      survey.birthDate = new Date(updateSurveyDto.birthDate);
    }

    Object.assign(survey, updateSurveyDto);
    return this.familySurveyRepository.save(survey);
  }

  async deleteSurvey(userId: number): Promise<void> {
    const survey = await this.findByUserId(userId);
    if (!survey) {
      throw new NotFoundException('설문조사를 찾을 수 없습니다.');
    }

    await this.familySurveyRepository.remove(survey);
  }

  // 관리자용: 통계 데이터
  async getStatistics() {
    const total = await this.familySurveyRepository.count();
    
    const relationshipStats = await this.familySurveyRepository
      .createQueryBuilder('survey')
      .select('survey.relationshipToDeceased', 'relationship')
      .addSelect('COUNT(*)', 'count')
      .groupBy('survey.relationshipToDeceased')
      .getRawMany();

    const supportLevelStats = await this.familySurveyRepository
      .createQueryBuilder('survey')
      .select('survey.psychologicalSupportLevel', 'supportLevel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('survey.psychologicalSupportLevel')
      .getRawMany();

    const meetingParticipationStats = await this.familySurveyRepository
      .createQueryBuilder('survey')
      .select('survey.meetingParticipationDesire', 'desire')
      .addSelect('COUNT(*)', 'count')
      .groupBy('survey.meetingParticipationDesire')
      .getRawMany();

    return {
      total,
      relationshipStats,
      supportLevelStats,
      meetingParticipationStats,
    };
  }
}
