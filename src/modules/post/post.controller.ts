import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreatePostCommand, EditPostCommand } from './commands'
import { CreatePostDto, EditPostDto, GetPostListDto } from './dto'
import { EditPostModel, PostModel, SimplePostModel } from './models/post'
import { GetPostListQuery, GetPostQuery } from './queries'

@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getPostList(
    @Query() query: GetPostListDto,
  ): Promise<SimplePostModel[]> {
    const { page, search_type, keyword, order } = query
    return await this.queryBus.execute(
      new GetPostListQuery(page, search_type, keyword, order),
    )
  }

  @Post()
  async createPost(@Body() body: CreatePostDto): Promise<{ id: number }> {
    const { title, content, author, password } = body
    const id = await this.commandBus.execute(
      new CreatePostCommand(title, content, author, password),
    )
    return { id }
  }

  @Get('/:id(\\d+)')
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return await this.queryBus.execute(new GetPostQuery(id))
  }

  @Patch('/:id(\\d+)')
  async editPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditPostDto,
  ): Promise<EditPostModel> {
    const { author, password, title, content } = body
    return await this.commandBus.execute(
      new EditPostCommand(id, author, password, title, content),
    )
  }
}
