import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreateCommentCommand, DeleteCommentCommand } from '../comment/commands'
import { CreatePostCommand, DeletePostCommand, EditPostCommand } from './commands'
import { CreateCommentDto, CreatePostDto, DeletePostDto, EditPostDto, GetPostListDto } from './dto'
import { DeleteCommentDto } from './dto/delete-comment.dto'
import { EditPostModel, PostModel, SimplePostModel } from './models/post'
import { GetPostListQuery, GetPostQuery } from './queries'

@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getPostList(@Query() query: GetPostListDto): Promise<SimplePostModel[]> {
    const { page, search_type, keyword, order } = query
    return await this.queryBus.execute(new GetPostListQuery(page, search_type, keyword, order))
  }

  @Post()
  async createPost(@Body() body: CreatePostDto): Promise<{ id: number }> {
    const { title, content, author, password } = body
    const id = await this.commandBus.execute(new CreatePostCommand(title, content, author, password))
    return { id }
  }

  @Get('/:id(\\d+)')
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return await this.queryBus.execute(new GetPostQuery(id))
  }

  @Patch('/:id(\\d+)')
  async editPost(@Param('id', ParseIntPipe) id: number, @Body() body: EditPostDto): Promise<EditPostModel> {
    const { author, password, title, content } = body
    return await this.commandBus.execute(new EditPostCommand(id, author, password, title, content))
  }

  @Delete('/:id(\\d+)')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ParseIntPipe) id: number, @Body() body: DeletePostDto) {
    const { author, password } = body
    await this.commandBus.execute(new DeletePostCommand(id, author, password))
  }

  @Post('/:id(\\d+)/comments')
  async createComment(@Param('id', ParseIntPipe) postId: number, @Body() body: CreateCommentDto) {
    const { content, author, password, comment_id } = body
    const id = await this.commandBus.execute(new CreateCommentCommand(postId, content, author, password, comment_id))
    return { id }
  }

  @Delete('/:postId(\\d+)/comments/:id(\\d+)')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() body: DeleteCommentDto,
  ) {
    const { author, password } = body
    await this.commandBus.execute(new DeleteCommentCommand(postId, commentId, author, password))
  }
}
