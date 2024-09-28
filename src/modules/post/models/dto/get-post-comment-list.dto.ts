import { Transform } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { SearchType } from '../post'

export class GetPostCommentListDto {
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value)) // 문자열을 숫자로 변환
  page: number

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc'
}
