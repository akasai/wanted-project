import { Injectable } from '@nestjs/common'
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { KeywordEvent } from '../../../post/events/impl'
import { CommentService } from '../../comment.service'
import { CreateCommentCommand } from '../impl'

@Injectable()
@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly commentService: CommentService,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateCommentCommand): Promise<number> {
    const { postId, content, author, password, commentId } = command
    const { id } = await this.commentService.createComment(postId, content, author, password, commentId)

    this.eventBus.publish(new KeywordEvent('comment', postId, content))

    return id
  }
}
