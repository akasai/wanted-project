import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator'

export class CreateCommentDto {
  @ApiProperty({ type: String, description: '댓글 내용' })
  @IsString()
  content: string

  @ApiProperty({ type: String, maxLength: 10, description: '댓글 작성자' })
  @IsString()
  @MaxLength(10)
  author: string

  @ApiProperty({ type: String, description: '비밀번호' })
  @IsString()
  password: string

  @ApiPropertyOptional({ type: Number, description: '댓글 ID(대댓글인 경우)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value)) // 문자열을 숫자로 변환
  comment_id?: number
}
