import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DeleteCommentCommand } from '../commands'
import { CommentService } from '../comment.service'

@Injectable()
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly commentService: CommentService) {}

  async execute(command: DeleteCommentCommand) {
    const { postId, commentId, author, password } = command
    const { id, status, updated_at } = await this.commentService.softDeleteComment(commentId, postId, author, password)
    return { id, status, updated_at }
  }
}
