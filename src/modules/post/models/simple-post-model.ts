import { ApiProperty } from '@nestjs/swagger'
import { post as Post } from '@prisma/client'
import { ISimplePostModel } from './post'

export class SimplePostModel implements ISimplePostModel {
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

  constructor(id: number, title: string, content: string, author: string, created_at: Date, updated_at: Date) {
    this.id = id
    this.title = title
    this.content = content
    this.author = author
    this.created_at = created_at
    this.updated_at = updated_at
  }

  static from(post: Post) {
    return new SimplePostModel(post.id, post.title, post.content, post.author_name, post.created_at, post.updated_at)
  }

  setCommentCount(count?: number) {
    this.comment_count = count || 0
    return this
  }
}
