import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CheckItemRequest {
  @ApiProperty({
    description: '구분',
    enum: ['KEY_ITEM', 'CHECKLIST_BEFORE_WORK', 'GENERAL_ITEM'],
    example: 'KEY_ITEM',
  })
  @IsIn(['KEY_ITEM', 'CHECKLIST_BEFORE_WORK', 'GENERAL_ITEM'])
  type: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['EYE', 'DOCUMENT', 'FUNCTION'],
    example: 'DOCUMENT',
  })
  @IsIn(['EYE', 'DOCUMENT', 'FUNCTION'])
  method: string;

  @ApiProperty({ description: '점검 항목 내용', example: '안전장비 상태 확인' })
  @IsString()
  content: string;
}

export class UpdateCheckItemRequest {
  @ApiProperty({
    description: '구분',
    enum: ['KEY_ITEM', 'CHECKLIST_BEFORE_WORK', 'GENERAL_ITEM'],
    example: 'KEY_ITEM',
  })
  @IsIn(['KEY_ITEM', 'CHECKLIST_BEFORE_WORK', 'GENERAL_ITEM'])
  @IsOptional()
  type: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['EYE', 'DOCUMENT', 'FUNCTION'],
    example: 'DOCUMENT',
  })
  @IsIn(['EYE', 'DOCUMENT', 'FUNCTION'])
  @IsOptional()
  method: string;

  @ApiProperty({ description: '점검 항목 내용', example: '안전장비 상태 확인' })
  @IsString()
  @IsOptional()
  content: string;
}
