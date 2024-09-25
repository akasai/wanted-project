import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator'

export class CreateCommentDto {
  @IsString()
  content: string

  @IsString()
  @MaxLength(10)
  author: string

  @IsString()
  password: string

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value)) // 문자열을 숫자로 변환
  comment_id?: number
}
