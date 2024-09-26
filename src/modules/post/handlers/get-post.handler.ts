import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import PostModel from '../models/post-model'
import { PostService } from '../post.service'
import { GetPostQuery } from '../queries'

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
  constructor(private readonly postService: PostService) {}

  async execute(query: GetPostQuery): Promise<PostModel> {
    const { id } = query
    const post = await this.postService.getPostById(id)
    return PostModel.from(post)
  }
}
