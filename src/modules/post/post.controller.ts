import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreatePostCommand } from './commands/create-post.command'
import { CreatePostDto } from './dto'
import { GetPostListDto } from './dto/get-post-list.dto'
import { PostModel, SimplePostModel } from './models/post'
import { GetPostListQuery } from './queries/get-post-list.query'
import { GetPostQuery } from './queries/get-post.query'

@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
  }

  @Get()
  async getPostList(@Query() query: GetPostListDto) {
    const { page, search_type, keyword, order } = query
    const list: SimplePostModel[] = await this.queryBus.execute(new GetPostListQuery(page, search_type, keyword, order))
    return list
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
  async getPost(@Param('id', ParseIntPipe) id: number) {
    const post: PostModel = await this.queryBus.execute(new GetPostQuery(id))
    return post
  }
}
