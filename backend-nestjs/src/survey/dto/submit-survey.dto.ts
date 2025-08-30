import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { RelationshipToDeceased, PsychologicalSupportLevel } from '../../entities/family-survey.entity';

export class SubmitSurveyDto {
  @IsDateString()
  birthDate: string;

  @IsEnum(RelationshipToDeceased)
  relationshipToDeceased: RelationshipToDeceased;

  @IsString()
  @IsOptional()
  relationshipDescription?: string;

  @IsEnum(PsychologicalSupportLevel)
  psychologicalSupportLevel: PsychologicalSupportLevel;

  @IsBoolean()
  meetingParticipationDesire: boolean;

  @IsString()
  @IsOptional()
  personalNotes?: string;

  @IsBoolean()
  @IsNotEmpty()
  privacyAgreement: boolean;

  @IsBoolean()
  @IsOptional()
  surveyCompleted?: boolean = true;
}
