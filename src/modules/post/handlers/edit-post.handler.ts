import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EditPostCommand } from '../commands'
import { PostService } from '../post.service'

@Injectable()
@CommandHandler(EditPostCommand)
export class EditPostHandler implements ICommandHandler<EditPostCommand> {
  constructor(private readonly postService: PostService) {}

  async execute(command: EditPostCommand) {
    const { id, author, password, title, content } = command
    const editValue = { title, content }
    const post = await this.postService.updatePost(
      id,
      author,
      password,
      editValue,
    )

    const result = {
      updated_at: post.updated_at,
      title: post.title,
      content: post.content,
    }
    if (!title) {
      delete result.title
    }
    if (!content) {
      delete result.content
    }
    return result
  }
}
