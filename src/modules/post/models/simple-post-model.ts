import { post as Post } from '@prisma/client'
import { IPostModel, ISimplePostModel } from './post'

export default class SimplePostModel implements ISimplePostModel {
  comment_count: number

  constructor(
    readonly id: number,
    readonly title: string,
    readonly content: string,
    readonly author: string,
    readonly created_at: Date,
    readonly updated_at: Date,
  ) {}

  static from(post: Post) {
    return new SimplePostModel(post.id, post.title, post.content, post.author_name, post.created_at, post.updated_at)
  }

  setCommentCount(count: number) {
    this.comment_count = count || 0
    return this
  }
}
