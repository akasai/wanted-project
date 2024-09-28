import { post as Post } from '@prisma/client'
import CommentModel from '../../comment/models/comment-model'
import { IPostModel } from './post'

export default class PostModel implements IPostModel {
  comment_count: number
  comment_list: CommentModel[]

  constructor(
    readonly id: number,
    readonly title: string,
    readonly content: string,
    readonly author: string,
    readonly created_at: Date,
    readonly updated_at: Date,
  ) {}

  static from(post: Post) {
    return new PostModel(post.id, post.title, post.content, post.author_name, post.created_at, post.updated_at)
  }

  setCommentCount(count?: number) {
    this.comment_count = count || 0
    return this
  }

  setCommentList(list?: CommentModel[]) {
    this.comment_list = list || []
    return this
  }
}
