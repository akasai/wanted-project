import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PostModel } from '../models/post'
import { PostService } from '../post.service'
import { GetPostQuery } from '../queries/get-post.query'

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(private readonly postService: PostService) {}

  async execute(query: GetPostQuery): Promise<PostModel> {
    const { id } = query
    const post = await this.postService.getPostById(id)
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author_name,
      created_at: post.created_at,
      updated_at: post.updated_at,
    }
  }
}
