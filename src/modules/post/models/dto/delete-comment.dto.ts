import { IsString, MaxLength } from 'class-validator'

export class DeleteCommentDto {
  @IsString()
  @MaxLength(10)
  author: string

  @IsString()
  password: string
}
