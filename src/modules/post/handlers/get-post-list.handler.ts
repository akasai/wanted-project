import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { ISimplePostModel } from '../models/post'
import { PostService } from '../post.service'
import { GetPostListQuery } from '../queries/get-post-list.query'

@QueryHandler(GetPostListQuery)
export class GetPostListHandler implements IQueryHandler<GetPostListQuery> {
  constructor(private readonly postService: PostService) {}

  async execute(query: GetPostListQuery): Promise<ISimplePostModel[]> {
    const { page, searchType, keyword, order } = query
    const filter = { author: undefined, title: '', order }
    if (searchType) {
      filter[searchType] = keyword
    }

    const list = await this.postService.getPostList(filter, page)
    return list.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author_name,
      created_at: post.created_at,
      updated_at: post.updated_at,
    }))
  }
}
