import { ApiProperty } from '@nestjs/swagger'
import { post as Post } from '@prisma/client'
import { CommentModel } from '../../comment/models'
import { IPostModel } from './post'

export class PostModel implements IPostModel {
  @ApiProperty({ type: Number, description: '게시물 ID' })
  id: number
  @ApiProperty({ type: String, description: '게시물 제목' })
  title: string
  @ApiProperty({ type: String, description: '게시물 내용' })
  content: string
  @ApiProperty({ type: String, description: '게시물 작성자' })
  author: string
  @ApiProperty({ type: Date, description: '게시물 작성일자' })
  created_at: Date
  @ApiProperty({ type: Date, description: '게시물 수정일자' })
  updated_at: Date
  @ApiProperty({ type: Number, description: '게시물 댓글 갯수' })
  comment_count: number
  @ApiProperty({ type: CommentModel, isArray: true, description: '댓글 목록' })
  comment_list: CommentModel[]

  constructor(id: number, title: string, content: string, author: string, created_at: Date, updated_at: Date) {
    this.id = id
    this.title = title
    this.content = content
    this.author = author
    this.created_at = created_at
    this.updated_at = updated_at
  }

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
