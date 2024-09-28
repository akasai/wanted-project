import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class DeletePostDto {
  @ApiProperty({ type: String, maxLength: 10, description: '작성자' })
  @IsString()
  @MaxLength(10)
  author: string

  @ApiProperty({ type: String, description: '비밀번호' })
  @IsString()
  password: string
}
