import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CommentService } from '../../comment/comment.service'
import { IPostModel } from '../models/post'
import PostModel from '../models/post-model'
import { PostService } from '../post.service'
import { GetPostQuery } from '../queries'

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  async execute(query: GetPostQuery): Promise<IPostModel> {
    const { id } = query
    const post = await this.postService.getPostById(id)
    const countMap = await this.commentService.getCommentCounts([post.id])
    return PostModel.from(post).setCommentCount(countMap.get(post.id))
  }
}
