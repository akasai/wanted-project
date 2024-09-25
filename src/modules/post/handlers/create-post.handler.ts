import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreatePostCommand } from '../commands/create-post.command'
import { PostService } from '../post.service'

@Injectable()
@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly postService: PostService) {}

  async execute(command: CreatePostCommand): Promise<number> {
    const { title, content, author, password } = command
    const { id } = await this.postService.createPost(title, content, author, password)
    return id
  }
}
