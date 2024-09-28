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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiNoContentResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { CreateCommentCommand, DeleteCommentCommand } from '../comment/commands/impl'
import { CommentModel, CreatedCommentModel } from '../comment/models'
import { GetCommentListQuery } from '../comment/queries/impl'
import { CreatePostCommand, DeletePostCommand, EditPostCommand } from './commands/impl'
import {
  CreateCommentDto,
  CreatedPostModel,
  CreatePostDto,
  DeletePostDto,
  EditPostDto,
  EditPostModel,
  GetPostCommentListDto,
  GetPostListDto,
  ISimplePostModel,
  PostModel,
  SimplePostModel,
} from './models'
import { DeleteCommentDto } from './models/dto/delete-comment.dto'
import { GetPostListQuery, GetPostQuery } from './queries/impl'

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ operationId: 'getPostList' })
  @ApiOkResponse({ status: HttpStatus.OK, type: [SimplePostModel] })
  async getPostList(@Query() query: GetPostListDto): Promise<ISimplePostModel[]> {
    const { page, search_type, keyword, order } = query
    return await this.queryBus.execute(new GetPostListQuery(page, search_type, keyword, order))
  }

  @Post()
  @ApiOperation({ operationId: 'createPost' })
  @ApiOkResponse({ status: HttpStatus.CREATED, type: CreatedPostModel })
  async createPost(@Body() body: CreatePostDto): Promise<CreatedPostModel> {
    const { title, content, author, password } = body
    const id = await this.commandBus.execute(new CreatePostCommand(title, content, author, password))
    return new CreatedPostModel(id)
  }

  @Get('/:id(\\d+)')
  @ApiOperation({ operationId: 'getPost' })
  @ApiOkResponse({ status: HttpStatus.OK, type: PostModel })
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return await this.queryBus.execute(new GetPostQuery(id))
  }

  @Patch('/:id(\\d+)')
  @ApiOperation({ operationId: 'editPost' })
  @ApiOkResponse({ status: HttpStatus.OK, type: EditPostModel })
  async editPost(@Param('id', ParseIntPipe) id: number, @Body() body: EditPostDto): Promise<EditPostModel> {
    const { author, password, title, content } = body
    const {
      title: editedTitle,
      content: editedContent,
      updated_at,
    } = await this.commandBus.execute(new EditPostCommand(id, author, password, title, content))
    return new EditPostModel(editedTitle, editedContent, updated_at)
  }

  @Delete('/:id(\\d+)')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'deletePost' })
  @ApiNoContentResponse({ status: HttpStatus.NO_CONTENT, description: 'No content 응답으로 body값은 없습니다.' })
  async deletePost(@Param('id', ParseIntPipe) id: number, @Body() body: DeletePostDto) {
    const { author, password } = body
    await this.commandBus.execute(new DeletePostCommand(id, author, password))
  }

  @Get('/:id(\\d+)/comments')
  @ApiOperation({ operationId: 'getPostCommentList' })
  @ApiOkResponse({ status: HttpStatus.OK, type: [CommentModel] })
  async getPostCommentList(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetPostCommentListDto,
  ): Promise<Array<CommentModel>> {
    const { page, order } = query
    return await this.queryBus.execute(new GetCommentListQuery(id, page, order))
  }

  @Post('/:id(\\d+)/comments')
  @ApiOperation({ operationId: 'createComment' })
  @ApiOkResponse({ status: HttpStatus.CREATED, type: CreatedCommentModel })
  async createComment(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
  ): Promise<CreatedCommentModel> {
    const { content, author, password, comment_id } = body
    const id = await this.commandBus.execute(new CreateCommentCommand(postId, content, author, password, comment_id))
    return new CreatedCommentModel(id)
  }

  @Delete('/:postId(\\d+)/comments/:id(\\d+)')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'deleteComment' })
  @ApiNoContentResponse({ status: HttpStatus.NO_CONTENT, description: 'No content 응답으로 body값은 없습니다.' })
  async deleteComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() body: DeleteCommentDto,
  ) {
    const { author, password } = body
    await this.commandBus.execute(new DeleteCommentCommand(postId, commentId, author, password))
  }
}
