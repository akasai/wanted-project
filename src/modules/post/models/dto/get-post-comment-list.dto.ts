import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'

export class GetPostCommentListDto {
  @ApiProperty({ type: Number, description: '페이지' })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value)) // 문자열을 숫자로 변환
  page: number

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: '정렬방법(오름차순(asc),내림차순(default:desc))' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc'
}
