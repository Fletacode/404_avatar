import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsBoolean()
  @IsOptional()
  isAdminPost?: boolean;
}
