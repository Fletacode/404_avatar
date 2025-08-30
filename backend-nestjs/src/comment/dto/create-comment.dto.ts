import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content should not be empty' })
  content: string;

  @IsString({ message: 'author must be a string' })
  @IsNotEmpty({ message: 'author should not be empty' })
  author: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'boardId must be a number' })
  boardId: number;
}
