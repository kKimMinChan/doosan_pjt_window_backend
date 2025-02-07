import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: '가져올 데이터의 수 (한 페이지의 항목 수)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: '가져올 페이지 번호',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;
}
