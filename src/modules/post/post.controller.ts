import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { CreatePostCommand } from './commands/create-post.command'
import { CreatePostDto } from './dto'

@Controller('posts')
export class PostController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createPost(@Body() body: CreatePostDto): Promise<{ id: number }> {
    const { title, content, author, password } = body
    const id = await this.commandBus.execute(
      new CreatePostCommand(title, content, author, password),
    )
    return { id }
  }
}
