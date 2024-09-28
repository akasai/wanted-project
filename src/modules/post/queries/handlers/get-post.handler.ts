import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CommentService } from '../../../comment/comment.service'
import { CommentModel } from '../../../comment/models'
import { PostModel } from '../../models'
import { PostService } from '../../post.service'
import { GetPostQuery } from '../impl'

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  async execute(query: GetPostQuery): Promise<PostModel> {
    const { id } = query
    const post = await this.postService.getPostById(id)
    const [countMap, list] = await Promise.all([
      this.commentService.getCommentCounts([post.id]),
      this.commentService.getNestedCommentList(post.id),
    ])
    const commentModelList = list.map((l) => CommentModel.from(l).setReply(l))
    return PostModel.from(post).setCommentCount(countMap.get(post.id)).setCommentList(commentModelList)
  }
}
