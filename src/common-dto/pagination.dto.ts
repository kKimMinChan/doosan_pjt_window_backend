import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: '가져올 데이터의 수 (한 페이지의 항목 수) 기본 값 = 10',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: '가져올 페이지 번호 기본 값 = 1',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'asc = 오름차순(오래된), desc = 내림차순(최신) 기본 값 = desc',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @Type(() => String)
  @IsIn(['asc', 'desc'])
  order?: string = 'desc';
}
