import { comments as Comments } from '@prisma/client'
import { ExtendedComment, ICommentModel } from './comment'

export default class CommentModel implements ICommentModel {
  reply: Array<ICommentModel>

  constructor(
    readonly id: number,
    readonly content: string,
    readonly author: string,
    readonly created_at: Date,
    readonly updated_at: Date,
  ) {}

  static from(comment: Comments) {
    return new CommentModel(comment.id, comment.content, comment.author_name, comment.created_at, comment.updated_at)
  }

  setReply(comment: ExtendedComment) {
    if (!comment.reply) {
      this.reply = []
      return this
    }
    this.reply = comment.reply.map((r) => CommentModel.from(r))
    return this
  }
}
