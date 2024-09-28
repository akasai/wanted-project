import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { SearchType } from '../post'

export class GetPostListDto {
  @ApiProperty({ type: Number, description: '페이지' })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value)) // 문자열을 숫자로 변환
  page: number

  @ApiPropertyOptional({ enum: ['author', 'title'], description: '검색 타입(작성자 검색=author,제목 검색=title)' })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'author'])
  search_type?: SearchType

  @ApiPropertyOptional({ type: String, description: '검색어' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: '정렬방법(오름차순(asc),내림차순(default:desc))' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc'
}
