import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMatchingDto {
  @IsNotEmpty()
  @IsNumber()
  counselorId: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
