import { ICommand } from '@nestjs/cqrs'

export class DeleteCommentCommand implements ICommand {
  constructor(
    readonly postId: number,
    readonly commentId: number,
    readonly author: string,
    readonly password: string,
  ) {}
}
