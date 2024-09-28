import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CommentService } from '../../../comment/comment.service'
import { ISimplePostModel } from '../../models'
import SimplePostModel from '../../models/simple-post-model'
import { PostService } from '../../post.service'
import { GetPostListQuery } from '../impl'

@QueryHandler(GetPostListQuery)
export class GetPostListHandler implements IQueryHandler<GetPostListQuery> {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  async execute(query: GetPostListQuery): Promise<ISimplePostModel[]> {
    const { page, searchType, keyword, order } = query
    const filter = { author: undefined, title: '', order }
    if (searchType) {
      filter[searchType] = keyword
    }

    const list = await this.postService.getPostList(filter, page)
    const countMap = await this.commentService.getCommentCounts(list.map(({ id }) => id))
    return list.map((post) => SimplePostModel.from(post).setCommentCount(countMap.get(post.id)))
  }
}
