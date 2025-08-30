import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: number): Promise<Board> {
    const { categoryId, ...boardData } = createBoardDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    const board = this.boardRepository.create({
      ...boardData,
      user,
      category,
    });

    return this.boardRepository.save(board);
  }

  async findAll(categoryId?: number): Promise<Board[]> {
    const queryBuilder = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .leftJoinAndSelect('board.category', 'category')
      .orderBy('board.createdAt', 'DESC');

    if (categoryId) {
      queryBuilder.where('board.category.id = :categoryId', { categoryId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.user', 'user')
      .leftJoinAndSelect('board.category', 'category')
      .where('board.id = :id', { id })
      .getOne();

    if (!board) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 조회수 증가
    await this.boardRepository.increment({ id }, 'viewCount', 1);

    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto, userId: number, isAdmin: boolean): Promise<Board> {
    const board = await this.findOne(id);

    // 작성자 또는 관리자만 수정 가능
    if (board.user.id !== userId && !isAdmin) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    const { categoryId, ...updateData } = updateBoardDto;

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException('카테고리를 찾을 수 없습니다.');
      }
      board.category = category;
    }

    Object.assign(board, updateData);
    return this.boardRepository.save(board);
  }

  async remove(id: number, userId: number, isAdmin: boolean): Promise<void> {
    const board = await this.findOne(id);

    // 작성자 또는 관리자만 삭제 가능
    if (board.user.id !== userId && !isAdmin) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    await this.boardRepository.remove(board);
  }
}
