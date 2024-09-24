import { IQuery } from '@nestjs/cqrs'
import { SearchType } from '../models/post'

export class GetPostListQuery implements IQuery {
  constructor(
    readonly page: number,
    readonly searchType?: SearchType,
    readonly keyword?: string,
    readonly order?: 'asc' | 'desc',
  ) {
  }
}
