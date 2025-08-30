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
  Query,
  ParseIntPipe 
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // @UseGuards(JwtAuthGuard) // 임시로 JWT 인증 비활성화
  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    console.log('=== POST /boards 요청 받음 ===');
    console.log('Raw request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Authorization:', req.headers.authorization ? 'Bearer token exists' : 'No token');
    console.log('Raw body:', req.body);
    console.log('Parsed DTO:', createBoardDto);
    console.log('DTO 상세 검사:');
    console.log('  title:', typeof createBoardDto.title, '=', JSON.stringify(createBoardDto.title));
    console.log('  content:', typeof createBoardDto.content, '=', JSON.stringify(createBoardDto.content));
    console.log('  author:', typeof createBoardDto.author, '=', JSON.stringify(createBoardDto.author));
    console.log('  categoryId:', typeof createBoardDto.categoryId, '=', createBoardDto.categoryId);
    console.log('  isAdminPost:', typeof createBoardDto.isAdminPost, '=', createBoardDto.isAdminPost);
    console.log('User from JWT:', req.user || 'No user (JWT disabled)');
    console.log('=====================================');
    
    // 임시로 하드코딩된 사용자 ID 사용 (실제 사용자 ID로 변경 필요)
    const tempUserId = 6; // 기존 사용자 ID 사용
    return this.boardService.create(createBoardDto, tempUserId);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.boardService.findAll(categoryIdNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.boardService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req
  ) {
    return this.boardService.update(id, updateBoardDto, req.user.id, req.user.isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.boardService.remove(id, req.user.id, req.user.isAdmin);
  }
}
