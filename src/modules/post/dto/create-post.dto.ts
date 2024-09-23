import { IsString, MaxLength } from 'class-validator'

export class CreatePostDto {
  @IsString()
  @MaxLength(80)
  title: string

  @IsString()
  content: string

  @IsString()
  @MaxLength(10)
  author: string

  @IsString()
  password: string
}
