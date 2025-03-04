import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CheckItemRequest {
  @ApiProperty({
    description: '구분',
    enum: ['key-item', 'checklist-before-work', 'general-item'],
    example: 'key-item',
  })
  @IsIn(['key-item', 'checklist-before-work', 'general-item'])
  type: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['eye', 'document', 'function'],
    example: 'document',
  })
  @IsIn(['eye', 'document', 'function'])
  method: string;

  @ApiProperty({ description: '점검 항목 내용', example: '안전장비 상태 확인' })
  @IsString()
  content: string;
}

export class UpdateCheckItemRequest {
  @ApiProperty({
    description: '구분',
    enum: ['key-item', 'checklist-before-work', 'general-item'],
    example: 'key-item',
  })
  @IsIn(['key-item', 'checklist-before-work', 'general-item'])
  @IsOptional()
  type: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['eye', 'document', 'function'],
    example: 'document',
  })
  @IsIn(['eye', 'document', 'function'])
  @IsOptional()
  method: string;

  @ApiProperty({ description: '점검 항목 내용', example: '안전장비 상태 확인' })
  @IsString()
  @IsOptional()
  content: string;
}
