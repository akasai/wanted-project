import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CommentService } from '../../comment.service'
import { CommentModel } from '../../models'
import { GetCommentListQuery } from '../impl'

@QueryHandler(GetCommentListQuery)
export class GetCommentListHandler implements IQueryHandler<GetCommentListQuery> {
  constructor(private readonly commentService: CommentService) {}

  async execute(query: GetCommentListQuery) {
    const { postId, page, order } = query
    const list = await this.commentService.getNestedCommentList(postId, order, page)
    return list.map((l) => CommentModel.from(l).setReply(l))
  }
}
