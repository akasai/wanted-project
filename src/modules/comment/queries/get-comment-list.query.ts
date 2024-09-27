import { IQuery } from '@nestjs/cqrs'

export class GetCommentListQuery implements IQuery {
  constructor(
    readonly postId: number,
    readonly page: number,
    readonly order?: 'asc' | 'desc',
  ) {
  }
}
