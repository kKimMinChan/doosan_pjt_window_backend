import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsDateString,
  IsIn,
  IsNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CheckedItem {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  @IsIn(['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'])
  division: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '문서',
  })
  @IsIn(['문서', '육안', '기능'])
  method: string;

  @ApiProperty({ description: '점검 항목 이름', example: '안전장비 상태 확인' })
  @IsString()
  content: string;

  @ApiProperty({ description: '항목 번호', example: 1 })
  @IsNumber()
  number: number;

  @ApiProperty({ description: '점검 결과', example: true })
  @IsBoolean()
  check: boolean;
}

export class CheckedItemRequest {
  @ApiProperty({ description: '점검 항목 목록', type: [CheckedItem] })
  @ValidateNested({ each: true }) // 배열 요소에 대해 각각 유효성 검사 수행
  @Type(() => CheckedItem) // 배열 요소의 타입 지정
  @ArrayNotEmpty({
    message: '점검 항목 목록(checkedItem)은 비어 있을 수 없습니다.',
  }) // 배열이 비어 있는지 확인
  checkedItems: CheckedItem[];

  @ApiProperty({
    description: '이슈 내용',
    example: '안전 장비 결함',
    required: false,
  })
  @IsString()
  issue?: string;
}

export class CheckedListResponse {
  @ApiProperty({ description: '점검 항목 목록', type: [CheckedItem] })
  @ValidateNested({ each: true }) // 배열 요소에 대해 각각 유효성 검사 수행
  @Type(() => CheckedItem) // 배열 요소의 타입 지정
  checkedItem: CheckedItem[];

  @ApiProperty({ description: '점검 날짜', example: '2024-01-05' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD이어야 합니다.',
  })
  date: string;

  @ApiProperty({
    description: '이슈 내용',
    example: '안전 장비 결함',
    required: false,
  })
  @IsString()
  issue?: string;

  @ApiProperty({
    description: '_id',
    example: '677df06a8ddda3eaa5189f75',
  })
  @IsString()
  _id: string;
}

export class DateDto {
  @ApiProperty({
    description: '받아올 날짜',
    example: '2024-01-05',
    required: true, // Query 파라미터는 선택적일 수 있으므로 명시적으로 설정
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD이어야 합니다.',
  })
  date: string;
}
