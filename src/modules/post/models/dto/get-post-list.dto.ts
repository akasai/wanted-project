import { Transform } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { SearchType } from '../post'

export class GetPostListDto {
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value)) // 문자열을 숫자로 변환
  page: number

  @IsOptional()
  @IsString()
  @IsIn(['title', 'author'])
  search_type?: SearchType

  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc'
}
