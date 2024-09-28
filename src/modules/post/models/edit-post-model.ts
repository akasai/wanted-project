import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IEditPostModel } from './post'

export class EditPostModel implements IEditPostModel {
  @ApiPropertyOptional({ type: String, description: '게시물 제목' })
  title?: string
  @ApiPropertyOptional({ type: String, description: '게시물 내용' })
  content?: string
  @ApiProperty({ type: Date, description: '게시물 수정일자' })
  updated_at: Date

  constructor(title: string, content: string, updated_at: Date) {
    this.title = title
    this.content = content
    this.updated_at = updated_at
  }
}
