import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from '../entities/comment.entity';
import { Board } from '../entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Board])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
