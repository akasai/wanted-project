import { post as Post } from '@prisma/client'
import { IPostModel } from './post'

export default class PostModel implements IPostModel {
  constructor(
    readonly id: number,
    readonly title: string,
    readonly content: string,
    readonly author: string,
    readonly created_at: Date,
    readonly updated_at: Date,
  ) {
  }

  static from(post: Post) {
    return new PostModel(
      post.id,
      post.title,
      post.content,
      post.author_name,
      post.created_at,
      post.updated_at,
    )
  }
}
