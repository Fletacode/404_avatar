import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBoardDto {
  @Transform(({ value }) => {
    console.log('Transform title - 입력값:', typeof value, '=', JSON.stringify(value));
    const result = typeof value === 'string' ? value.trim() : String(value || '');
    console.log('Transform title - 변환결과:', typeof result, '=', JSON.stringify(result));
    return result;
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title should not be empty' })
  title: string;

  @Transform(({ value }) => {
    console.log('Transform content - 입력값:', typeof value, '=', JSON.stringify(value));
    const result = typeof value === 'string' ? value.trim() : String(value || '');
    console.log('Transform content - 변환결과:', typeof result, '=', JSON.stringify(result));
    return result;
  })
  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content should not be empty' })
  content: string;

  @Transform(({ value }) => {
    console.log('Transform author - 입력값:', typeof value, '=', JSON.stringify(value));
    const result = typeof value === 'string' ? value.trim() : String(value || '');
    console.log('Transform author - 변환결과:', typeof result, '=', JSON.stringify(result));
    return result;
  })
  @IsString({ message: 'author must be a string' })
  @IsNotEmpty({ message: 'author should not be empty' })
  author: string;

  @Transform(({ value }) => {
    console.log('Transform categoryId - 입력값:', typeof value, '=', JSON.stringify(value));
    const num = Number(value);
    console.log('Transform categoryId - 변환시도:', num, 'isNaN:', isNaN(num));
    const result = isNaN(num) ? 0 : num;
    console.log('Transform categoryId - 변환결과:', result);
    return result;
  })
  @IsNumber({}, { message: 'categoryId must be a number conforming to the specified constraints' })
  categoryId: number;

  @Transform(({ value }) => {
    console.log('Transform isAdminPost - 입력값:', typeof value, '=', JSON.stringify(value));
    let result = false;
    if (value === undefined || value === null) {
      result = false;
    } else if (typeof value === 'string') {
      result = value.toLowerCase() === 'true';
    } else {
      result = Boolean(value);
    }
    console.log('Transform isAdminPost - 변환결과:', typeof result, '=', result);
    return result;
  })
  @IsBoolean({ message: 'isAdminPost must be a boolean' })
  @IsOptional()
  isAdminPost?: boolean = false;
}
