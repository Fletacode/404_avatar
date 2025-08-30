import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Board } from '../entities/board.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    // 게시글 존재 확인
    const board = await this.boardRepository.findOne({
      where: { id: createCommentDto.boardId }
    });

    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });

    return this.commentRepository.save(comment);
  }

  async findByBoardId(boardId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { boardId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'board'],
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number, isAdmin: boolean = false): Promise<Comment> {
    const comment = await this.findOne(id);

    // 댓글 작성자 또는 관리자만 수정 가능
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number, isAdmin: boolean = false): Promise<void> {
    const comment = await this.findOne(id);

    // 댓글 작성자 또는 관리자만 삭제 가능
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.commentRepository.delete(id);
  }

  async getCommentCount(boardId: number): Promise<number> {
    return this.commentRepository.count({ where: { boardId } });
  }
}
