import { IsOptional, IsString, MaxLength } from 'class-validator'

export class EditPostDto {
  @IsString()
  @MaxLength(10)
  author: string

  @IsString()
  password: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string

  @IsOptional()
  @IsString()
  content?: string
}
