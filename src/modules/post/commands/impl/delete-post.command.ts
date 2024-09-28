import { ICommand } from '@nestjs/cqrs'

export class DeletePostCommand implements ICommand {
  constructor(
    readonly id: number,
    readonly author: string,
    readonly password: string,
  ) {}
}
