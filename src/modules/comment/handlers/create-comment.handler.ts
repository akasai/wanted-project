import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateCommentCommand } from '../commands'
import { CommentService } from '../comment.service'

@Injectable()
@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(private readonly commentService: CommentService) {
  }

  async execute(command: CreateCommentCommand): Promise<number> {
    const { postId, content, author, password, commentId } = command
    const { id } = await this.commentService.createComment(postId, content, author, password, commentId)
    return id
  }
}
