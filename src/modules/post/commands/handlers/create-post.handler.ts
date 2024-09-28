import { Injectable } from '@nestjs/common'
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs'
import { CreatePostCommand } from '../impl'
import { KeywordEvent } from '../../events/impl'
import { PostService } from '../../post.service'

@Injectable()
@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postService: PostService,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreatePostCommand): Promise<number> {
    const { title, content, author, password } = command
    const { id } = await this.postService.createPost(title, content, author, password)

    this.eventBus.publish(new KeywordEvent('post', id, content))

    return id
  }
}
