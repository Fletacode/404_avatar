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

  @UseGuards(JwtAuthGuard)
  @Post()
  submitSurvey(@Body() submitSurveyDto: SubmitSurveyDto, @Request() req) {
    return this.surveyService.submitSurvey(submitSurveyDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-survey')
  getMySurvey(@Request() req) {
    return this.surveyService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('my-survey')
  updateMySurvey(@Body() updateSurveyDto: Partial<SubmitSurveyDto>, @Request() req) {
    return this.surveyService.updateSurvey(req.user.id, updateSurveyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('my-survey')
  deleteMySurvey(@Request() req) {
    return this.surveyService.deleteSurvey(req.user.id);
  }

  // 관리자용 엔드포인트
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('all')
  getAllSurveys() {
    return this.surveyService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('statistics')
  getStatistics() {
    return this.surveyService.getStatistics();
  }
}
