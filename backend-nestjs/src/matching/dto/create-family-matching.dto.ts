import { IsNumber } from 'class-validator';

export class CreateFamilyMatchingDto {
  @IsNumber()
  familyGroupId: number;
}
