import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CheckSheetInfo {
  @ApiProperty({ description: '공장 이름', example: '원자력 공장' })
  @IsString()
  factory_name: string;

  @ApiProperty({ description: '장비 이름', example: '지게차' })
  @IsString()
  equipment_name: string;

  @ApiProperty({ description: '장비 번호', example: 'A55' })
  @IsString()
  equipment_number: string;

  @ApiProperty({ description: '점검자 이름', example: '선임' })
  @IsString()
  inspector: string;

  @ApiProperty({ description: '확인자 이름', example: '총괄' })
  @IsString()
  checker: string;
}

const division = ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'];
const method = ['문서', '육안', '기능'];
export class CheckList {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  @IsIn(division)
  division: string;

  @ApiProperty({ description: '항목 번호', example: 1 })
  @IsNumber()
  number: number;

  @ApiProperty({ description: '점검 항목 이름', example: '안전벨트 점검' })
  @IsString()
  content: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '육안',
  })
  @IsIn(method)
  method: string;
}

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

export class CheckedListDto {
  @ApiProperty({ description: '점검 항목 목록', type: [CheckedItem] })
  @ValidateNested({ each: true }) // 배열 요소에 대해 각각 유효성 검사 수행
  @Type(() => CheckedItem) // 배열 요소의 타입 지정
  @ArrayNotEmpty({
    message: '점검 항목 목록(checkedItem)은 비어 있을 수 없습니다.',
  }) // 배열이 비어 있는지 확인
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
}

export class ImageUrl {
  @ApiProperty({
    description: '이미지 URL',
    example: 'uploads/지게차1.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}

export class CreateInputDto {
  @ApiProperty({
    description: '작업 안전 점검표 정보',
    type: () => CheckSheetInfo,
  })
  checkSheetInfo: CheckSheetInfo;

  @ApiProperty({
    description: '작업 점검 목록',
    type: [CheckList],
    example: [
      {
        division: '핵심 항목',
        number: 1,
        content: '차량계 하역운반 작업계획서를 작성하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 2,
        content: '작업계획서의 내용을 작업자에게 설명/교육하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 3,
        content: '작업 지휘자가 지정되어 작업계획서에 따라 작얼을 지휘하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 4,
        content: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 5,
        content: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 6,
        content: '하역장치(포크 크랙/변형, 마스크 제인 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 7,
        content: '유압장치(누유, 유압작동유 적정성 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 8,
        content: '전조등, 후미등, 방향지시기 및 경보장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 9,
        content: '바퀴의 마모상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 10,
        content: '밧데리 증류수액 및 충전표시 상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 11,
        content: '각동 게기 작동상태 및 이상소음은 발생하지 않는가?',
        method: '기능',
        check: true,
      },
      {
        division: '일반 항목',
        number: 12,
        content: '안전벨트가 정상적으로 작동하고 작업자는 체결하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '일반 항목',
        number: 13,
        content: '적재물의 편하중 및 운전자 시야 확보에 문제가 없는가?',
        method: '육안',
        check: true,
      },
    ],
  })
  checkLists: CheckList[];

  @ApiProperty({
    description:
      'formData.append("files", file) 작업 안전 점검표 이미지 -> 안전 점검표 이미지는 총 4장까지 업로드 가능',
    format: 'binary',
    required: false,
  })
  files: Express.Multer.File[];
}

export class UpdateInputDto {
  @ApiProperty({
    description: '작업 안전 점검표 정보',
    type: () => CheckSheetInfo,
  })
  checkSheetInfo: CheckSheetInfo;

  @ApiProperty({
    description: '작업 점검 목록',
    type: [CheckList],
    example: [
      {
        division: '핵심 항목',
        number: 1,
        content: '차량계 하역운반 작업계획서를 작성하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 2,
        content: '작업계획서의 내용을 작업자에게 설명/교육하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 3,
        content: '작업 지휘자가 지정되어 작업계획서에 따라 작얼을 지휘하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 4,
        content: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 5,
        content: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 6,
        content: '하역장치(포크 크랙/변형, 마스크 제인 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 7,
        content: '유압장치(누유, 유압작동유 적정성 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 8,
        content: '전조등, 후미등, 방향지시기 및 경보장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 9,
        content: '바퀴의 마모상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 10,
        content: '밧데리 증류수액 및 충전표시 상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 11,
        content: '각동 게기 작동상태 및 이상소음은 발생하지 않는가?',
        method: '기능',
        check: true,
      },
      {
        division: '일반 항목',
        number: 12,
        content: '안전벨트가 정상적으로 작동하고 작업자는 체결하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '일반 항목',
        number: 13,
        content: '적재물의 편하중 및 운전자 시야 확보에 문제가 없는가?',
        method: '육안',
        check: true,
      },
    ],
  })
  checkLists: CheckList[];

  @ApiProperty({
    description:
      '이미지 목록 -> 기존 이미지, 안전 점검표 이미지는 총 4장까지 업로드 가능',
    type: [ImageUrl],
    example: [
      {
        image_url: 'uploads/지게차1.png',
      },
      {
        image_url: 'uploads/지게차2.png',
      },
      {
        image_url: 'uploads/지게차3.png',
      },
      {
        image_url: 'uploads/지게차4.png',
      },
    ],
    required: false,
  })
  originImagePaths?: ImageUrl[];

  @ApiProperty({
    description:
      'formData.append("files", file) 작업 안전 점검표 이미지 -> 새로운 이미지 넣을 거면 파일로, 안전 점검표 이미지는 총 4장까지 업로드 가능',
    format: 'binary',
    required: false,
  })
  files: Express.Multer.File[];
}
