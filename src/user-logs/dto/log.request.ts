import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { EventType } from '../entities/log.schema';
import mongoose from 'mongoose';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common-dto/pagination.dto';

export class UserLogRequest {
  @ApiProperty({
    description: '어떤 이벤트 발생했는가',
    enum: EventType,
    required: true,
  })
  @IsEnum(EventType)
  event: string;

  @ApiProperty({
    description: '성공여부',
    example: false,
  })
  @IsOptional() // ✅ null 또는 undefined일 수 있음
  @IsBoolean() // ✅ true 또는 false만 허용
  @Transform(({ value }) => value === 'true' || value === true)
  result: boolean | null;

  @ApiProperty({
    description: '운전자 id',
    example: '67d7dcdaba6ebc84e0add560',
    required: false,
  })
  @IsString()
  @IsOptional()
  user: mongoose.Types.ObjectId | null;

  @ApiProperty({
    description: '중장비 id',
    example: '67d7dcdaba6ebc84e0add560',
    required: false,
  })
  @IsString()
  @IsOptional()
  equipment: mongoose.Types.ObjectId | null;

  @ApiProperty({
    description: '업로드할 파일',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  file?: Express.MulterS3.File;
}

export class UserLogPaginationDto extends PartialType(PaginationDto) {
  @ApiProperty({
    description:
      'event에 대한 필터링 (face-recognition, streaming) 기본 값 face-recognition',
    enum: EventType,
    required: false,
  })
  @IsOptional()
  @IsIn(['face-recognition', 'streaming'])
  event: EventType;
}
