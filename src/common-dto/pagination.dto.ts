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
    description: '1 = 오름차순(오래된), -1 = 내림차순(최신) 기본 값 = -1',
    enum: [1, -1],
    example: -1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([1, -1])
  sort?: number = -1;
}
