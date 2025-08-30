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

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    return this.boardService.create(createBoardDto, req.user.id);
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
