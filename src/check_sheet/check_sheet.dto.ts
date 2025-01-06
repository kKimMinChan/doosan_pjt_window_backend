import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckSheetInfoDto {
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
export class CheckListDto {
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
  check_item: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '육안',
  })
  @IsIn(method)
  method: string;
}

export class CheckItemDto {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  division: string;

  @ApiProperty({
    description: '점검 방법',
    enum: ['문서', '육안', '기능'],
    example: '문서',
  })
  method: string;

  @ApiProperty({ description: '점검 항목 이름', example: '안전장비 상태 확인' })
  check_item: string;

  @ApiProperty({ description: '항목 번호', example: 1 })
  number: number;

  @ApiProperty({ description: '점검 결과', example: true })
  check: boolean;
}

export class CheckedListDto {
  @ApiProperty({ description: '점검 항목 목록', type: [CheckItemDto] })
  item: CheckItemDto[];

  @ApiProperty({ description: '점검 날짜', example: '2024-01-05' })
  date: string;

  @ApiProperty({
    description: '이슈 내용',
    example: '안전 장비 결함',
    required: false,
  })
  issue?: string;
}

export class ImageDto {
  @ApiProperty({
    description: 'Base64 인코딩된 이미지 데이터',
    required: false,
  })
  @IsOptional()
  @IsString()
  base64?: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'uploads/지게차4.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;
}
export class ImageInputDto {
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
    type: () => CheckSheetInfoDto,
  })
  checkSheetInfo: CheckSheetInfoDto;

  @ApiProperty({
    description: '작업 점검 목록',
    type: [CheckListDto],
    example: [
      {
        division: '핵심 항목',
        number: 1,
        check_item: '차량계 하역운반 작업계획서를 작성하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 2,
        check_item: '작업계획서의 내용을 작업자에게 설명/교육하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 3,
        check_item:
          '작업 지휘자가 지정되어 작업계획서에 따라 작얼을 지휘하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 4,
        check_item: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 5,
        check_item: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 6,
        check_item:
          '하역장치(포크 크랙/변형, 마스크 제인 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 7,
        check_item: '유압장치(누유, 유압작동유 적정성 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 8,
        check_item: '전조등, 후미등, 방향지시기 및 경보장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 9,
        check_item: '바퀴의 마모상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 10,
        check_item: '밧데리 증류수액 및 충전표시 상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 11,
        check_item: '각동 게기 작동상태 및 이상소음은 발생하지 않는가?',
        method: '기능',
        check: true,
      },
      {
        division: '일반 항목',
        number: 12,
        check_item: '안전벨트가 정상적으로 작동하고 작업자는 체결하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '일반 항목',
        number: 13,
        check_item: '적재물의 편하중 및 운전자 시야 확보에 문제가 없는가?',
        method: '육안',
        check: true,
      },
    ],
  })
  checkLists: CheckListDto[];

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
    type: () => CheckSheetInfoDto,
  })
  checkSheetInfo: CheckSheetInfoDto;

  @ApiProperty({
    description: '작업 점검 목록',
    type: [CheckListDto],
    example: [
      {
        division: '핵심 항목',
        number: 1,
        check_item: '차량계 하역운반 작업계획서를 작성하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 2,
        check_item: '작업계획서의 내용을 작업자에게 설명/교육하였는가?',
        method: '문서',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 3,
        check_item:
          '작업 지휘자가 지정되어 작업계획서에 따라 작얼을 지휘하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '핵심 항목',
        number: 4,
        check_item: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 5,
        check_item: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 6,
        check_item:
          '하역장치(포크 크랙/변형, 마스크 제인 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 7,
        check_item: '유압장치(누유, 유압작동유 적정성 등) 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 8,
        check_item: '전조등, 후미등, 방향지시기 및 경보장치 기능은 이상없는가?',
        method: '기능',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 9,
        check_item: '바퀴의 마모상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 10,
        check_item: '밧데리 증류수액 및 충전표시 상태는 이상없는가?',
        method: '육안',
        check: true,
      },
      {
        division: '작업 전 점검사항(법적)',
        number: 11,
        check_item: '각동 게기 작동상태 및 이상소음은 발생하지 않는가?',
        method: '기능',
        check: true,
      },
      {
        division: '일반 항목',
        number: 12,
        check_item: '안전벨트가 정상적으로 작동하고 작업자는 체결하는가?',
        method: '육안',
        check: true,
      },
      {
        division: '일반 항목',
        number: 13,
        check_item: '적재물의 편하중 및 운전자 시야 확보에 문제가 없는가?',
        method: '육안',
        check: true,
      },
    ],
  })
  checkLists: CheckListDto[];

  @ApiProperty({
    description:
      '이미지 목록 -> 기존 이미지, 안전 점검표 이미지는 총 4장까지 업로드 가능',
    type: [ImageInputDto],
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
  originImagePath: ImageInputDto[];

  @ApiProperty({
    description:
      'formData.append("files", file) 작업 안전 점검표 이미지 -> 새로운 이미지 넣을 거면 파일로, 안전 점검표 이미지는 총 4장까지 업로드 가능',
    format: 'binary',
    required: false,
  })
  files: Express.Multer.File[];
}

export class CheckSheetOutputDto {
  @ApiProperty({
    description: '작업 안전 점검표 정보',
    type: CheckSheetInfoDto,
  })
  checkSheetInfo: CheckSheetInfoDto;

  @ApiProperty({ description: '작업 점검 목록', type: [CheckListDto] })
  checkLists: CheckListDto[];

  @ApiProperty({
    description: '이미지 목록',
    type: [ImageDto],
    required: false,
  })
  image: ImageDto[];

  @ApiProperty({
    description: '작성된 날짜별 점검 목록',
    type: [CheckedListDto],
    required: false,
  })
  checkedList: CheckedListDto[];
}
