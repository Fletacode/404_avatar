import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { SurveyModule } from './survey/survey.module';
import { User } from './entities/user.entity';
import { Board } from './entities/board.entity';
import { Category } from './entities/category.entity';
import { FamilySurvey } from './entities/family-survey.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Board, Category, FamilySurvey],
      synchronize: true, // 개발 환경에서만 사용, 프로덕션에서는 false
      logging: true,
    }),
    AuthModule,
    BoardModule,
    SurveyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
