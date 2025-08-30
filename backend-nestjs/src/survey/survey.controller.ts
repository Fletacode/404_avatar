import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Post()
  submitSurvey(@Body() submitSurveyDto: SubmitSurveyDto, @Request() req) {
    console.log('Submitting survey with data:', submitSurveyDto);
    console.log('User:', req.user || 'No user (JWT disabled)');
    
    // 임시로 하드코딩된 사용자 ID 사용
    const tempUserId = 6;
    return this.surveyService.submitSurvey(submitSurveyDto, tempUserId);
  }

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Get('my-survey')
  getMySurvey(@Request() req) {
    const tempUserId = 6;
    return this.surveyService.findByUserId(tempUserId);
  }

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Patch('my-survey')
  updateMySurvey(@Body() updateSurveyDto: Partial<SubmitSurveyDto>, @Request() req) {
    const tempUserId = 6;
    return this.surveyService.updateSurvey(tempUserId, updateSurveyDto);
  }

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Delete('my-survey')
  deleteMySurvey(@Request() req) {
    const tempUserId = 6;
    return this.surveyService.deleteSurvey(tempUserId);
  }

  // 관리자용 엔드포인트
  // @UseGuards(JwtAuthGuard, AdminGuard) // 임시로 JWT 인증 비활성화
  @Get('all')
  getAllSurveys() {
    return this.surveyService.findAll();
  }

  // @UseGuards(JwtAuthGuard, AdminGuard) // 임시로 JWT 인증 비활성화
  @Get('statistics')
  getStatistics() {
    return this.surveyService.getStatistics();
  }
}
