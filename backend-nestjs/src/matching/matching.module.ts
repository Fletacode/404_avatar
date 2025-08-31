import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { Counselor } from '../entities/counselor.entity';
import { Matching } from '../entities/matching.entity';
import { User } from '../entities/user.entity';
import { FamilyGroup } from '../entities/family-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Counselor, Matching, User, FamilyGroup])],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
