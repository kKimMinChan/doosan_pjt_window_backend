import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CheckItem {
  @ApiProperty({
    description: '항목 구분',
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
    example: '핵심 항목',
  })
  @IsIn(['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'])
  type: string;

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

  @ApiProperty({
    description: '인덱스',
    example: 1,
  })
  @IsNumber()
  index: number;
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

// export class CheckedListDto {
//   @ApiProperty({ description: '점검 항목 목록', type: [CheckedItem] })
//   @ValidateNested({ each: true }) // 배열 요소에 대해 각각 유효성 검사 수행
//   @Type(() => CheckedItem) // 배열 요소의 타입 지정
//   @ArrayNotEmpty({
//     message: '점검 항목 목록(checkedItem)은 비어 있을 수 없습니다.',
//   }) // 배열이 비어 있는지 확인
//   checkedItem: CheckedItem[];

//   @ApiProperty({ description: '점검 날짜', example: '2024-01-05' })
//   @Matches(/^\d{4}-\d{2}-\d{2}$/, {
//     message: '날짜 형식은 YYYY-MM-DD이어야 합니다.',
//   })
//   date: string;

//   @ApiProperty({
//     description: '이슈 내용',
//     example: '안전 장비 결함',
//     required: false,
//   })
//   @IsString()
//   issue?: string;
// }

export class ImageUrl {
  @ApiProperty({
    description: '이미지 URL',
    example: 'uploads/지게차1.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CheckSheetRequest {
  @ApiProperty({
    description: '작업 점검 목록',
    type: [CheckItem],
    required: true,
    example: [
      {
        type: '핵심 항목',
        content: '차량계 하역운반 작업계획서를 작성하였는가?',
        method: '문서',
        index: 1,
      },
      {
        type: '핵심 항목',
        content: '작업계획서의 내용을 작업자에게 설명/교육하였는가?',
        method: '문서',
        index: 2,
      },
      {
        type: '핵심 항목',
        content: '작업 지휘자가 지정되어 작업계획서에 따라 작얼을 지휘하는가?',
        method: '육안',
        index: 3,
      },
      {
        type: '작업 전 점검사항(법적)',
        content: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '육안',
        index: 4,
      },
      {
        type: '일반 항목',
        content: '제동장치 및 조종장치 기능은 이상없는가?',
        method: '기능',
        index: 6,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckItem)
  checkItems: CheckItem[];

  @ApiProperty({
    description:
      'formData.append("files", file) 작업 안전 점검표 이미지 -> 안전 점검표 이미지는 총 4장까지 업로드 가능',
    format: 'binary',
    required: false,
  })
  files?: Express.Multer.File[];
}

// export class UpdateCheckSheetRequest {
//   @ApiProperty({
//     description: '작업 점검 목록',
//     type: [CheckList],
//     example: [
//       {
//         type: '핵심 항목',
//         number: 1,
//         content: '차량계 하역운반 작업계획서를 작성하였는가?',
//         method: '문서',
//       },
//       {
//         type: '핵심 항목',
//         number: 2,
//         content: '차량계 하역운반 작업계획서를 작성하였는가?',
//         method: '문서',
//       },
//       {
//         type: '일반 항목',
//         number: 13,
//         content: '적재물의 편하중 및 운전자 시야 확보에 문제가 없는가?',
//         method: '육안',
//       },
//     ],
//     required: false,
//   })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => CheckList)
//   checkLists: CheckList[];

//   @ApiProperty({
//     description:
//       '이미지 목록 -> 기존 이미지, 안전 점검표 이미지는 총 4장까지 업로드 가능',
//     type: [String],
//     // isArray: true,
//     example: [
//       'uploads/지게차1.png',
//       'uploads/지게차2.png',
//       'uploads/지게차3.png',
//     ],
//     required: false,
//   })
//   @IsArray()
//   @IsString({ each: true })
//   imageUrls?: string[];

//   @ApiProperty({
//     description:
//       'formData.append("files", file) 작업 안전 점검표 이미지 -> 새로운 이미지 넣을 거면 파일로, 안전 점검표 이미지는 총 4장까지 업로드 가능',
//     format: 'binary',
//     required: false,
//   })
//   files: Express.Multer.File[];
// }
