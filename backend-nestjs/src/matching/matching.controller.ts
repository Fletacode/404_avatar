import { Controller, Get, Post, Put, Body, Param, Request, ParseIntPipe } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { CreateMatchingDto, UpdateMatchingDto, CreateFamilyMatchingDto } from './dto';
import { Counselor } from '../entities/counselor.entity';
import { Matching } from '../entities/matching.entity';
import { FamilyGroup } from '../entities/family-group.entity';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('counselors')
  async getAllCounselors(): Promise<Counselor[]> {
    return this.matchingService.getAllCounselors();
  }

  @Get('counselors/recommended')
  async getRecommendedCounselors(): Promise<Counselor[]> {
    // 임시로 하드코딩된 사용자 ID 사용 (첫 번째 사용자)
    return this.matchingService.findMatchingCounselors(1);
  }

  @Get('counselors/:id')
  async getCounselorById(@Param('id', ParseIntPipe) id: number): Promise<Counselor> {
    return this.matchingService.getCounselorById(id);
  }

  @Post()
  async createMatching(@Body() createMatchingDto: CreateMatchingDto): Promise<Matching> {
    // 임시로 하드코딩된 사용자 ID 사용 (첫 번째 사용자)
    return this.matchingService.createMatching(1, createMatchingDto.counselorId);
  }

  @Get('my-matchings')
  async getMyMatchings(): Promise<Matching[]> {
    // 임시로 하드코딩된 사용자 ID 사용 (첫 번째 사용자)
    return this.matchingService.getUserMatchings(1);
  }

  @Put(':id')
  async updateMatching(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchingDto: UpdateMatchingDto
  ): Promise<Matching> {
    return this.matchingService.updateMatchingStatus(
      id, 
      updateMatchingDto.status, 
      updateMatchingDto.notes
    );
  }

  // 유가족 그룹 관련 엔드포인트들
  @Get('family-groups')
  async getAllFamilyGroups(): Promise<FamilyGroup[]> {
    return this.matchingService.getAllFamilyGroups();
  }

  @Get('family-groups/recommended')
  async getRecommendedFamilyGroups(): Promise<FamilyGroup[]> {
    // 임시로 하드코딩된 사용자 ID 사용 (첫 번째 사용자)
    return this.matchingService.findMatchingFamilyGroups(1);
  }

  @Get('family-groups/:id')
  async getFamilyGroupById(@Param('id', ParseIntPipe) id: number): Promise<FamilyGroup> {
    return this.matchingService.getFamilyGroupById(id);
  }

  @Post('family-groups')
  async createFamilyMatching(@Body() createFamilyMatchingDto: CreateFamilyMatchingDto): Promise<Matching> {
    // 임시로 하드코딩된 사용자 ID 사용 (첫 번째 사용자)
    return this.matchingService.createFamilyMatching(1, createFamilyMatchingDto.familyGroupId);
  }

  @Get('my-family-matchings')
  async getMyFamilyMatchings(): Promise<Matching[]> {
    // 임시로 하드코딩된 사용자 ID 사용 (첫 번째 사용자)
    return this.matchingService.getUserFamilyMatchings(1);
  }
}
