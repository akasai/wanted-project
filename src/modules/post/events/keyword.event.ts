import { IEvent } from '@nestjs/cqrs'

export class KeywordEvent implements IEvent {
  constructor(
    readonly type: string,
    readonly postId: number,
    readonly content: string,
  ) {
  }
}
