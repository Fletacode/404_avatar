import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { SurveyModule } from './survey/survey.module';
import { CommentModule } from './comment/comment.module';
import { MatchingModule } from './matching/matching.module';
import { User } from './entities/user.entity';
import { Board } from './entities/board.entity';
import { Category } from './entities/category.entity';
import { Comment } from './entities/comment.entity';
import { FamilySurvey } from './entities/family-survey.entity';
import { Counselor } from './entities/counselor.entity';
import { Matching } from './entities/matching.entity';
import { FamilyGroup } from './entities/family-group.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Board, Category, Comment, FamilySurvey, Counselor, Matching, FamilyGroup],
      synchronize: true, // 개발 환경에서만 사용, 프로덕션에서는 false
      logging: true,
    }),
    AuthModule,
    BoardModule,
    SurveyModule,
    CommentModule,
    MatchingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
