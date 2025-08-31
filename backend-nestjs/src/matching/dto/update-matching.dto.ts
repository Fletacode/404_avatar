import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MatchingStatus } from '../../entities/matching.entity';

export class UpdateMatchingDto {
  @IsEnum(MatchingStatus)
  status: MatchingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
