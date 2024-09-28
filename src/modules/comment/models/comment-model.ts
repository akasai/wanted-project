import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { comments as Comments } from '@prisma/client'
import { ExtendedComment, ICommentModel } from './comment'

export class CommentModel implements ICommentModel {
  @ApiProperty({ type: Number, description: '댓글 ID' })
  id: number
  @ApiProperty({ type: String, description: '댓글 내용' })
  content: string
  @ApiProperty({ type: String, description: '댓글 작성자' })
  author: string
  @ApiProperty({ type: Date, description: '댓글 작성일자' })
  created_at: Date
  @ApiProperty({ type: Date, description: '댓글 수정일자' })
  updated_at: Date
  @ApiPropertyOptional({ type: CommentModel, isArray: true, description: '대댓글 목록' })
  reply: Array<ICommentModel>

  constructor(id: number, content: string, author: string, created_at: Date, updated_at: Date) {
    this.id = id
    this.content = content
    this.author = author
    this.created_at = created_at
    this.updated_at = updated_at
  }

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
