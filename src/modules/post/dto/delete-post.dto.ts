import { IsString, MaxLength } from 'class-validator'

export class DeletePostDto {
  @IsString()
  @MaxLength(10)
  author: string

  @IsString()
  password: string
}
