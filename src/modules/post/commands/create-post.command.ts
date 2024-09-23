import { ICommand } from '@nestjs/cqrs'

export class CreatePostCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly author: string,
    readonly password: string,
  ) {}
}
