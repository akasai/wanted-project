import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class CreatePostDto {
  @ApiProperty({ type: String, maxLength: 80, description: '게시물 제목' })
  @IsString()
  @MaxLength(80)
  title: string

  @ApiProperty({ type: String, description: '게시물 내용' })
  @IsString()
  content: string

  @ApiProperty({ type: String, maxLength: 10, description: '작성자' })
  @IsString()
  @MaxLength(10)
  author: string

  @ApiProperty({ type: String, description: '비밀번호' })
  @IsString()
  password: string
}
