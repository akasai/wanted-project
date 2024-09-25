import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DeletePostCommand } from '../commands'
import { PostService } from '../post.service'

@Injectable()
@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postService: PostService) {}

  async execute(command: DeletePostCommand) {
    const { id, author, password } = command
    const deleted = await this.postService.softDeletePost(id, author, password)
    return {
      id: deleted.id,
      status: deleted.status,
      updated_at: deleted.updated_at,
    }
  }
}
