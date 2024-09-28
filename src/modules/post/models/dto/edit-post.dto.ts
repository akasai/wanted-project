import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class EditPostDto {
  @ApiProperty({ type: String, maxLength: 10, description: '작성자' })
  @IsString()
  @MaxLength(10)
  author: string

  @ApiProperty({ type: String, description: '비밀번호' })
  @IsString()
  password: string

  @ApiPropertyOptional({ type: String, maxLength: 80, description: '게시물 제목' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string

  @ApiPropertyOptional({ type: String, description: '게시물 내용' })
  @IsOptional()
  @IsString()
  content?: string
}
