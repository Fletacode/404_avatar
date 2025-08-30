import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Board } from '../entities/board.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Category, User])],
  controllers: [BoardController, CategoryController],
  providers: [BoardService, CategoryService],
  exports: [BoardService, CategoryService],
})
export class BoardModule {}
