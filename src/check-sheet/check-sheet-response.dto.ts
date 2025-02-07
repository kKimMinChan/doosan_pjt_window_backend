import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CheckSheetInfo {
  @ApiProperty({ description: '공장 이름', example: '원자력 공장' })
  factory_name: string;

  @ApiProperty({ description: '장비 이름', example: '지게차' })
  equipment_name: string;

  @ApiProperty({ description: '장비 번호', example: 'A55' })
  equipment_number: string;

  @ApiProperty({ description: '점검자 이름', example: '선임' })
  inspector: string;

  @ApiProperty({ description: '확인자 이름', example: '총괄' })
  checker: string;
}

export class CheckList {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  division: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'];

  @ApiProperty({ description: '항목 번호', example: 1 })
  number: number;

  @ApiProperty({ description: '점검 항목 이름', example: '안전벨트 점검' })
  check_item: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '육안',
  })
  method: ['문서', '육안', '기능'];
}

export class Image {
  @ApiProperty({
    description: 'Base64 인코딩된 이미지 데이터',
    required: false,
  })
  base64?: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'uploads/지게차4.png',
    required: false,
  })
  image_url?: string;
}

export class CheckedItem {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  division: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'];

  @ApiProperty({ description: '항목 번호', example: 1 })
  number: number;

  @ApiProperty({ description: '점검 항목 이름', example: '안전벨트 점검' })
  content: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '육안',
  })
  method: ['문서', '육안', '기능'];

  @ApiProperty({ description: '점검 결과', example: true })
  check: boolean;
}

export class CheckedListResponse {
  @ApiProperty({ description: '점검 항목 목록', type: [CheckedItem] })
  checkedItem: CheckedItem[];

  @ApiProperty({ description: '점검 날짜', example: '2024-01-05' })
  date: string;

  @ApiProperty({
    description: '이슈 내용',
    example: '안전 장비 결함',
    required: false,
  })
  issue?: string;

  @ApiProperty({
    description: '_id',
    example: '677df06a8ddda3eaa5189f75',
  })
  _id: string;
}

export class CheckSheetResponse {
  @ApiProperty({ description: '작업 점검 목록', type: [CheckList] })
  checkLists: CheckList[];

  @ApiProperty({
    description: '이미지 목록',
    type: [Image],
  })
  image: Image[];

  @ApiProperty({
    description: '중장비 id',
  })
  heavyEquipmentId: string;

  @ApiProperty({
    description: 'ObjectId',
    example: '64c75aebc9c70e27d8b5a9d2',
  })
  id: string;
}
