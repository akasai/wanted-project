import { ApiProperty } from '@nestjs/swagger'

export class CreatedCommentModel {
  @ApiProperty({ type: Number, description: '게시물 ID' })
  id: number

  constructor(id: number) {
    this.id = id
  }
}
