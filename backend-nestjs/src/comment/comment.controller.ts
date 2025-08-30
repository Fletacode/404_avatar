import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    console.log('Creating comment with data:', createCommentDto);
    console.log('User:', req.user || 'No user (JWT disabled)');
    
    // 임시로 하드코딩된 사용자 ID 사용
    const tempUserId = 6;
    return this.commentService.create(createCommentDto, tempUserId);
  }

  @Get('board/:boardId')
  findByBoardId(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.commentService.findByBoardId(boardId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    const tempUserId = 6;
    const isAdmin = false;
    return this.commentService.update(id, updateCommentDto, tempUserId, isAdmin);
  }

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const tempUserId = 6;
    const isAdmin = false;
    return this.commentService.remove(id, tempUserId, isAdmin);
  }

  @Get('count/:boardId')
  getCommentCount(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.commentService.getCommentCount(boardId);
  }
}
