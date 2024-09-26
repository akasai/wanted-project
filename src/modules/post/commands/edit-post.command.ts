import { ICommand } from '@nestjs/cqrs'

export class EditPostCommand implements ICommand {
  constructor(
    readonly id: number,
    readonly author: string,
    readonly password: string,
    readonly title?: string,
    readonly content?: string,
  ) {}
}
