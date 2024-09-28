import { ICommand } from '@nestjs/cqrs'

export class CreateCommentCommand implements ICommand {
  constructor(
    readonly postId: number,
    readonly content: string,
    readonly author: string,
    readonly password: string,
    readonly commentId?: number,
  ) {}
}
