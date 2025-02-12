import { ApiProperty } from '@nestjs/swagger';

export class CheckItem {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  type: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'];

  @ApiProperty({ description: '점검 항목 이름', example: '안전벨트 점검' })
  content: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '육안',
  })
  method: ['문서', '육안', '기능'];

  @ApiProperty({ description: '점검 결과', example: true })
  isOk: boolean;

  @ApiProperty({ description: 'id', example: '67ac319b5467f6cb206e408e' })
  id: string;
}

export class CheckSheetInfoResponse {
  @ApiProperty({
    description: '중장비 유형',
    example: '지게차',
    enum: ['지게차', '대차', '크레인'],
  })
  type: string;

  @ApiProperty({ description: '작업 점검 목록', type: [CheckItem] })
  checkItems: CheckItem[];

  @ApiProperty({
    description: '이미지 목록',
    example: ['김민찬.jpg', '김철환.jpg'],
  })
  imageUrls: string[];

  @ApiProperty({
    description: 'ObjectId',
    example: '64c75aebc9c70e27d8b5a9d2',
  })
  id: string;
}
