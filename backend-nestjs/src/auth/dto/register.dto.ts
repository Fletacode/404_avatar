import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { RelationshipToDeceased, PsychologicalSupportLevel } from '../../entities/family-survey.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean = false;

  // 설문조사 관련 필드들
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(RelationshipToDeceased)
  relationshipToDeceased?: RelationshipToDeceased;

  @IsOptional()
  @IsString()
  relationshipDescription?: string;

  @IsOptional()
  @IsEnum(PsychologicalSupportLevel)
  psychologicalSupportLevel?: PsychologicalSupportLevel;

  @Transform(({ value }) => value === true || value === 'true')
  @IsOptional()
  @IsBoolean()
  meetingParticipationDesire?: boolean = false;

  @IsOptional()
  @IsString()
  personalNotes?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsOptional()
  @IsBoolean()
  privacyAgreement?: boolean = false;
}
